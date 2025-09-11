import os
import shutil
from jinja2 import Environment, FileSystemLoader
import mistune
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import html
from pygments.util import ClassNotFound

# --- Custom Renderer for Syntax Highlighting ---
class HighlightRenderer(mistune.HTMLRenderer):
    def block_code(self, code, info=None):
        if info:
            try:
                lexer = get_lexer_by_name(info, stripall=True)
                formatter = html.HtmlFormatter()
                return highlight(code, lexer, formatter)
            except ClassNotFound:
                pass
        return '<pre><code>' + mistune.escape(code) + '</code></pre>'

# --- Configuration ---
CONTENT_DIR = 'content'
SITE_DIR = '_site'
STATIC_DIR = 'static'
TEMPLATE_DIR = 'templates'
SRC_DIR = 'src'

# --- Setup ---
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
markdown = mistune.create_markdown(renderer=HighlightRenderer())

def bundle_css():
    """
    Bundles and minifies CSS files.
    """
    print("Bundling CSS...")
    css_sources = [
        os.path.join(SRC_DIR, 'css', 'basscss.css'),
        os.path.join(SRC_DIR, 'css', 'colors.css'),
        os.path.join(SRC_DIR, 'css', 'font.css'),
        'editor.md/css/editormd.css', # This is still needed for markdown body styling
        os.path.join(SRC_DIR, 'css', 'pygments.css'),
        os.path.join(SRC_DIR, 'css', 'custom.css'),
    ]

    # Create static/css dir if it doesn't exist
    os.makedirs(os.path.join(SITE_DIR, STATIC_DIR, 'css'), exist_ok=True)

    output_path = os.path.join(SITE_DIR, STATIC_DIR, 'css', 'style.css')

    with open('temp_style.css', 'w') as outfile:
        for fname in css_sources:
            with open(fname) as infile:
                outfile.write(infile.read())

    os.system(f"cleancss -o {output_path} temp_style.css")
    os.remove('temp_style.css')
    print("CSS bundled successfully.")


def main():
    """
    Main function to build the static site.
    """
    # Create the site directory, cleaning it first
    if os.path.exists(SITE_DIR):
        shutil.rmtree(SITE_DIR)
    os.makedirs(SITE_DIR)

    # Bundle CSS
    bundle_css()

    # Create content directories and render markdown files
    for root, _, files in os.walk(CONTENT_DIR):
        # Determine the output directory
        relative_path = os.path.relpath(root, CONTENT_DIR)
        if relative_path == '.':
            output_dir = SITE_DIR
        else:
            output_dir = os.path.join(SITE_DIR, relative_path)

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for file in files:
            # Skip index.md files, they are handled by generate_index_pages
            if file == 'index.md':
                continue

            if file.endswith('.md'):
                process_markdown_file(root, file, output_dir)
            else: # just copy other files
                shutil.copy(os.path.join(root, file), output_dir)

    # Generate index pages
    generate_index_pages()


def generate_index_pages():
    """
    Generates index.html for each directory in the content folder.
    """
    print("Generating index pages...")
    list_template = env.get_template('list.html')

    for root, dirs, files in os.walk(CONTENT_DIR):
        items = []
        # Add subdirectories
        for d in sorted(dirs):
            items.append({'name': f'{d}/', 'url': f'{d}/index.html'})

        # Add markdown files
        for f in sorted(files):
            if f.endswith('.md') and f != 'index.md':
                name = os.path.splitext(f)[0]
                items.append({'name': name, 'url': f'{name}.html'})

        # Determine output path for the index.html
        relative_path = os.path.relpath(root, CONTENT_DIR)
        if relative_path == '.':
            output_path = os.path.join(SITE_DIR, 'index.html')
            title = "Home"
        else:
            output_path = os.path.join(SITE_DIR, relative_path, 'index.html')
            title = relative_path

        # Render and write the index.html file
        rendered_html = list_template.render(title=title, items=items)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(rendered_html)

    print("Index pages generated successfully.")


def process_markdown_file(root, filename, output_dir):
    """
    Reads a markdown file, renders it with a template, and saves it as HTML.
    """
    filepath = os.path.join(root, filename)
    html_filename = os.path.splitext(filename)[0] + '.html'
    output_filepath = os.path.join(output_dir, html_filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Simple parsing for now, no frontmatter
    html_content = markdown(md_content)

    template = env.get_template('post.html')
    rendered_html = template.render(content=html_content, title="My Blog Post") # Placeholder title

    with open(output_filepath, 'w', encoding='utf-8') as f:
        f.write(rendered_html)

    print(f"Rendered: {filepath} -> {output_filepath}")


if __name__ == '__main__':
    main()

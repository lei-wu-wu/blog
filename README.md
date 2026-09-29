# blog

A small static blog, published directly with HTML, CSS and JavaScript.

## Writing a Markdown article

### One-command publishing

Put a new `.md` file directly in `article-md/`, then run:

```sh
./publish.sh
```

The script finds every unpublished Markdown file and automatically:

1. reads the title and summary;
2. creates the matching page in `article-html/`;
3. inserts the article at the top of the homepage;
4. skips anything that has already been published.

The filename becomes the article URL, so prefer a short lowercase slug such as `my-new-post.md`. The minimum source is:

```markdown
# My new post

The first ordinary paragraph becomes the homepage summary.
```

You can optionally provide exact metadata at the top of the file:

```markdown
---
title: "My new post"
description: "The summary shown on the homepage and in search metadata."
---

# My new post
```

Useful variants:

```sh
# Publish one selected file
./publish.sh article-md/my-new-post.md

# Validate without changing files
./publish.sh --dry-run article-md/my-new-post.md
```

The publisher never overwrites an existing article. If an HTML page and its homepage entry are inconsistent, it stops and asks you to inspect them instead of guessing.

### Images and other local files

Keep shared article resources in one directory:

```text
assets/images/
```

Use a lowercase descriptive filename without spaces, then reference it from Markdown with a path relative to `article-md/`:

```markdown
![Useful alternative text](../assets/images/my-diagram.webp)
```

The same path also works from the generated page in `article-html/`, because both directories sit at the same level as `assets/`. Other downloadable resources can use the same directory and ordinary Markdown links:

```markdown
[Download the report](../assets/images/report.pdf)
```

### How rendering works

Articles can now keep their content in `article-md/` and use a lightweight HTML shell in `article-html/`. The shell only needs the shared styles, rendering libraries, and an article element pointing at the Markdown file:

```html
<article
    class="markdown-body"
    data-markdown-src="../article-md/my-post.md"
    aria-live="polite"
    aria-busy="true">
    <div class="render-loading" role="status">Loading article…</div>
</article>
```

Load the pinned browser libraries from `vendor/` before `js/markdown-renderer.js`:

- [Marked](https://marked.js.org/) for GitHub-flavored Markdown;
- [DOMPurify](https://github.com/cure53/DOMPurify) for sanitizing generated HTML;
- [highlight.js](https://highlightjs.org/) for fenced code blocks;
- [KaTeX](https://katex.org/) and its auto-render extension for inline `$…$` and display `$$…$$` formulas.

All scripts, styles, and KaTeX fonts are stored locally, so published articles do not depend on a CDN. The example article includes a `LaTeX / Manuscript / Sage / Ocean / Night` reader-theme selector, with LaTeX as the default. Theme colors and typography live in `css/style.css`; code themes live in `vendor/highlight/styles/` and are mapped in `js/markdown-renderer.js`.

Every Markdown article automatically gets a table of contents from its `##`, `###`, and `####` headings. It stays on the left and highlights the current section on wide screens; on narrower screens it becomes a collapsed panel above the article. No table-of-contents markup is needed in the Markdown source.

`article-html/rethinking-security-fp.html` is the first migrated example. The publishing script keeps the title, description, and navigation in the generated HTML shell so every article still has its own browser and search metadata.

Because Markdown is a separate source file, browsers will not allow an HTML file opened with `file://` to read it. Preview the site through a local HTTP server:

```sh
python3 -m http.server 8000
```

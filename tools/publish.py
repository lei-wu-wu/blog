#!/usr/bin/env python3
"""Publish Markdown files into the static blog.

With no file arguments, every Markdown file without a matching article HTML
page is published. Explicit file arguments can be used to publish selected
articles only.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent.parent
MARKDOWN_DIR = ROOT / "article-md"
ARTICLE_DIR = ROOT / "article-html"
TEMPLATE_PATH = ROOT / "templates" / "article.html"
INDEX_PATH = ROOT / "index.html"
POST_LIST_MARKER = '<ul class="post-list">'


def parse_front_matter(text: str) -> tuple[dict[str, str], str]:
    """Read the small title/description subset needed by this blog."""
    normalized = text.lstrip("\ufeff")
    if not normalized.startswith("---\n"):
        return {}, normalized

    end = normalized.find("\n---\n", 4)
    if end == -1:
        raise ValueError("front matter 缺少结束标记 ---")

    metadata: dict[str, str] = {}
    for raw_line in normalized[4:end].splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if ":" not in raw_line:
            raise ValueError(f"无法识别 front matter：{raw_line}")
        key, value = raw_line.split(":", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        metadata[key.strip().lower()] = value

    return metadata, normalized[end + 5 :]


def plain_text(markdown: str) -> str:
    text = re.sub(r"!\[([^]]*)]\([^)]+\)", r"\1", markdown)
    text = re.sub(r"\[([^]]+)]\([^)]+\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[`*_~]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def infer_summary(body: str, title: str) -> str:
    in_fence = False
    paragraph: list[str] = []

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if line.startswith("```") or line.startswith("~~~"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if not line:
            if paragraph:
                break
            continue
        if re.match(r"^#{1,6}\s+", line):
            continue
        if re.match(r"^(?:[-*_]\s*){3,}$", line):
            continue
        if line.startswith((">", "- ", "* ", "+ ", "|", "$$")):
            continue
        if re.match(r"^\d+[.)]\s+", line):
            continue
        paragraph.append(line)

    summary = plain_text(" ".join(paragraph)) or f"关于《{title}》的一些思考。"
    return summary if len(summary) <= 120 else summary[:117].rstrip() + "…"


def read_article(markdown_path: Path) -> tuple[str, str]:
    metadata, body = parse_front_matter(markdown_path.read_text(encoding="utf-8"))
    heading = re.search(r"^#\s+(.+?)\s*$", body, flags=re.MULTILINE)
    title = plain_text(metadata.get("title", "") or (heading.group(1) if heading else ""))
    if not title:
        raise ValueError("找不到文章标题，请添加一级标题：# 文章标题")

    description = plain_text(metadata.get("description", "")) or infer_summary(body, title)
    return title, description


def resolve_markdown_files(arguments: list[str]) -> list[Path]:
    if arguments:
        files = []
        for argument in arguments:
            path = Path(argument)
            if not path.is_absolute():
                path = ROOT / path
            path = path.resolve()
            if path.parent != MARKDOWN_DIR.resolve():
                raise ValueError(f"Markdown 文件必须直接放在 {MARKDOWN_DIR}")
            files.append(path)
    else:
        files = sorted(MARKDOWN_DIR.glob("*.md"), key=lambda path: path.stat().st_mtime, reverse=True)

    return [path for path in files if path.is_file() and not path.name.startswith(".")]


def article_html(template: str, markdown_path: Path, title: str, description: str) -> str:
    return (
        template.replace("{{TITLE}}", html.escape(title, quote=True))
        .replace("{{DESCRIPTION}}", html.escape(description, quote=True))
        .replace("{{MARKDOWN_FILE}}", html.escape(quote(markdown_path.name), quote=True))
    )


def index_entry(markdown_path: Path, title: str, description: str) -> str:
    slug = markdown_path.stem
    article_url = "./article-html/" + quote(slug + ".html")
    return "\n".join(
        [
            f'            <li data-post="{html.escape(slug, quote=True)}">',
            f'                <a href="{html.escape(article_url, quote=True)}">{html.escape(title)}</a>',
            f"                <p>{html.escape(description)}</p>",
            "            </li>",
        ]
    )


def preflight(markdown_path: Path, index: str) -> None:
    """Validate every candidate before the first file is written."""
    if markdown_path.suffix.lower() != ".md":
        raise ValueError(f"不是 Markdown 文件：{markdown_path.name}")

    output_path = ARTICLE_DIR / f"{markdown_path.stem}.html"
    article_url = "./article-html/" + quote(output_path.name)
    already_linked = article_url in index
    if output_path.exists() != already_linked:
        raise ValueError(
            f"{markdown_path.name} 的 HTML 页面与首页记录不一致，请先手动检查：{output_path}"
        )
    if not output_path.exists():
        read_article(markdown_path)


def publish(markdown_path: Path, template: str, index: str, dry_run: bool) -> tuple[str, bool]:
    if markdown_path.suffix.lower() != ".md":
        raise ValueError(f"不是 Markdown 文件：{markdown_path.name}")

    output_path = ARTICLE_DIR / f"{markdown_path.stem}.html"
    article_url = "./article-html/" + quote(output_path.name)
    already_linked = article_url in index

    if output_path.exists() and already_linked:
        print(f"跳过（已发布）：{markdown_path.name}")
        return index, False
    if output_path.exists() != already_linked:
        raise ValueError(
            f"{markdown_path.name} 的 HTML 页面与首页记录不一致，请先手动检查：{output_path}"
        )

    title, description = read_article(markdown_path)
    print(f"准备发布：{title}")
    print(f"  摘要：{description}")
    print(f"  页面：article-html/{output_path.name}")

    if dry_run:
        return index, True

    output_path.write_text(
        article_html(template, markdown_path, title, description), encoding="utf-8"
    )
    insertion = POST_LIST_MARKER + "\n" + index_entry(markdown_path, title, description)
    index = index.replace(POST_LIST_MARKER, insertion, 1)
    return index, True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="生成文章 HTML，并把尚未发布的 Markdown 加到首页。"
    )
    parser.add_argument("files", nargs="*", help="可选：只发布指定的 article-md/*.md")
    parser.add_argument("--dry-run", action="store_true", help="只检查，不写入文件")
    args = parser.parse_args()

    try:
        files = resolve_markdown_files(args.files)
        template = TEMPLATE_PATH.read_text(encoding="utf-8")
        index = INDEX_PATH.read_text(encoding="utf-8")
        if POST_LIST_MARKER not in index:
            raise ValueError("index.html 中找不到文章列表")

        for markdown_path in files:
            preflight(markdown_path, index)

        published = 0
        for markdown_path in files:
            index, changed = publish(markdown_path, template, index, args.dry_run)
            published += int(changed)

        if published and not args.dry_run:
            INDEX_PATH.write_text(index, encoding="utf-8")

        if published == 0:
            print("没有发现需要发布的新文章。")
        elif args.dry_run:
            print(f"检查完成：{published} 篇文章可以发布，未修改任何文件。")
        else:
            print(f"发布完成：{published} 篇文章已生成并加入首页。")
        return 0
    except (OSError, ValueError) as error:
        print(f"发布失败：{error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

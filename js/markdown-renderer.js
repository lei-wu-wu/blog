(function () {
    "use strict";

    var article = document.querySelector("[data-markdown-src]");
    var themeSelect = document.getElementById("reader-theme");
    var highlightTheme = document.getElementById("highlight-theme");
    var themes = {
        latex: "github.min.css",
        manuscript: "atom-one-light.min.css",
        sage: "atom-one-light.min.css",
        ocean: "github.min.css",
        night: "github-dark-dimmed.min.css"
    };

    if (!article) {
        return;
    }

    function setTheme(theme) {
        var selectedTheme = Object.prototype.hasOwnProperty.call(themes, theme) ? theme : "latex";

        document.documentElement.dataset.readerTheme = selectedTheme;
        if (themeSelect) {
            themeSelect.value = selectedTheme;
        }
        if (highlightTheme) {
            highlightTheme.href = highlightTheme.dataset.themeBase + themes[selectedTheme];
        }

        try {
            window.localStorage.setItem("reader-theme", selectedTheme);
        } catch (error) {
            // The theme still works when storage is unavailable.
        }
    }

    function savedTheme() {
        try {
            var theme = window.localStorage.getItem("reader-theme");

            if (theme === "classic") {
                return "latex";
            }
            if (theme === "paper") {
                return "manuscript";
            }
            return theme || "latex";
        } catch (error) {
            return "latex";
        }
    }

    setTheme(savedTheme());
    if (themeSelect) {
        themeSelect.addEventListener("change", function (event) {
            setTheme(event.target.value);
        });
    }

    function slugify(text, usedSlugs) {
        var base = text
            .trim()
            .toLowerCase()
            .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-") || "section";
        var slug = base;
        var count = 2;

        while (usedSlugs.has(slug)) {
            slug = base + "-" + count;
            count += 1;
        }

        usedSlugs.add(slug);
        return slug;
    }

    function buildTableOfContents(container) {
        var toc = document.querySelector(".article-toc");
        var list = toc && toc.querySelector("ol");
        var headings = Array.from(container.querySelectorAll("h2, h3, h4"));

        if (!toc || !list || headings.length < 2) {
            var layout = document.querySelector(".article-layout");
            if (layout) {
                layout.classList.add("without-toc");
            }
            return;
        }

        headings.forEach(function (heading) {
            var item = document.createElement("li");
            var link = document.createElement("a");

            item.className = "toc-level-" + heading.tagName.slice(1);
            link.href = "#" + heading.id;
            link.textContent = heading.dataset.tocLabel;
            link.dataset.target = heading.id;
            item.appendChild(link);
            list.appendChild(item);
        });

        toc.hidden = false;
        if (window.matchMedia("(max-width: 1100px)").matches) {
            toc.open = false;
        }

        var links = Array.from(list.querySelectorAll("a"));
        var scheduled = false;

        function updateActiveLink() {
            var active = headings[0];
            var readingLine = window.scrollY + Math.min(180, window.innerHeight * 0.28);

            headings.forEach(function (heading) {
                if (heading.offsetTop <= readingLine) {
                    active = heading;
                }
            });

            links.forEach(function (link) {
                var isActive = link.dataset.target === active.id;
                link.classList.toggle("is-active", isActive);
                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
            scheduled = false;
        }

        window.addEventListener("scroll", function () {
            if (!scheduled) {
                scheduled = true;
                window.requestAnimationFrame(updateActiveLink);
            }
        }, { passive: true });
        updateActiveLink();
    }

    function enhanceArticle(container) {
        var usedSlugs = new Set();

        container.querySelectorAll("h2, h3, h4").forEach(function (heading) {
            var label = heading.textContent.trim();
            var id = slugify(label, usedSlugs);
            var anchor = document.createElement("a");

            heading.id = id;
            heading.dataset.tocLabel = label;
            anchor.className = "heading-anchor";
            anchor.href = "#" + id;
            anchor.setAttribute("aria-label", "链接到“" + label + "”");
            anchor.textContent = "#";
            heading.appendChild(anchor);
        });

        buildTableOfContents(container);

        container.querySelectorAll("a[href]").forEach(function (link) {
            if (link.hostname && link.hostname !== window.location.hostname) {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
        });

        container.querySelectorAll("pre code").forEach(function (block) {
            window.hljs.highlightElement(block);
        });

        window.renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\[", right: "\\]", display: true },
                { left: "\\(", right: "\\)", display: false },
                { left: "$", right: "$", display: false }
            ],
            throwOnError: false
        });
    }

    function showError(error) {
        article.removeAttribute("aria-busy");

        if (window.location.protocol === "file:") {
            article.innerHTML = [
                '<div class="render-error" role="alert">',
                "<h1>请通过本地静态服务器预览</h1>",
                "<p>浏览器出于安全限制，禁止直接打开的 HTML 读取相邻 Markdown 文件。这不是外部资源错误。</p>",
                "<p>请在博客目录运行 <code>python3 -m http.server 8000</code>，然后访问 <code>http://localhost:8000</code>。</p>",
                '<p><a href="' + article.dataset.markdownSrc + '">也可以直接查看 Markdown 原文</a></p>',
                "</div>"
            ].join("");
            return;
        }

        article.innerHTML = [
            '<div class="render-error" role="alert">',
            "<h1>文章暂时无法载入</h1>",
            "<p>请刷新页面后重试，并确认 Markdown 文件已经随网站一起发布。</p>",
            "</div>"
        ].join("");
        console.error("Markdown rendering failed:", error);
    }

    if (!window.marked || !window.DOMPurify || !window.hljs || !window.renderMathInElement) {
        showError(new Error("A Markdown rendering dependency failed to load."));
        return;
    }

    fetch(article.dataset.markdownSrc, { credentials: "same-origin" })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Markdown request failed with status " + response.status);
            }
            return response.text();
        })
        .then(function (markdown) {
            var rendered = window.marked.parse(markdown.replace(/^\uFEFF/, ""), {
                gfm: true,
                breaks: false
            });
            var safeHtml = window.DOMPurify.sanitize(rendered, {
                USE_PROFILES: { html: true },
                SANITIZE_NAMED_PROPS: true,
                FORBID_ATTR: ["style"]
            });

            article.innerHTML = safeHtml;
            enhanceArticle(article);
            article.removeAttribute("aria-busy");
            article.classList.add("is-rendered");
        })
        .catch(showError);
}());

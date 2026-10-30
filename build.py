"""Assemble le site de révision en un seul fichier HTML autonome.

Usage : python3 build.py  ->  index.html
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
CONTENT = SRC / "content"

# id du bloc <script> -> fichier source
BLOCKS = {
    "c-cours1": "cours-ch1.md",
    "c-cours2": "cours-ch2.md",
    "c-notions": "notions.md",
    "c-td": "td.md",
    "c-datasets": "datasets.md",
    "c-quiz": ["quiz-ch1.txt", "quiz-ch2.txt"],
    "c-qcm": "qcm.txt",
    "c-annales": "annales.txt",
    "c-flash": "flashcards.txt",
}


def main():
    html = (SRC / "template.html").read_text(encoding="utf-8")
    blocks = []
    for block_id, name in BLOCKS.items():
        names = name if isinstance(name, list) else [name]
        text = "\n\n".join((CONTENT / n).read_text(encoding="utf-8") for n in names)
        if "</script" in text.lower():
            raise SystemExit(f"{names} contient '</script' : interdit dans un bloc inline")
        blocks.append(f'<script type="text/plain" id="{block_id}">\n{text}\n</script>')
    html = html.replace("/*__CSS__*/", (SRC / "style.css").read_text(encoding="utf-8"))
    html = html.replace("<!--__CONTENT__-->", "\n".join(blocks))
    html = html.replace("/*__JS__*/", (SRC / "app.js").read_text(encoding="utf-8"))
    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"{out} : {len(html.encode('utf-8')) / 1024:.0f} Ko")


if __name__ == "__main__":
    main()

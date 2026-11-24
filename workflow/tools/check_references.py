"""Check that references in the project's Markdown files resolve.

Read-only: prints a report and exits 1 if a reference is broken. Run from
the project root: python3 workflow/tools/check_references.py
It checks the Markdown files in the folder above tools/ (workflow/).

Checks:
- [[name]] wikilinks point to docs/name.md
- `path.md` references to this project (bare names, docs/, global-standards/) exist
- `workflow/...` paths exist, from the project root
- § numbers after a global-standards guide name point to an existing section

docs/05-decisions.md, docs/done-archive.md and the Done section of TODO.md
are skipped for paths: their entries are true for their date, so names that
have since changed are correct there; the first two are skipped whole.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT.parent
SKIP_DIRS = {".git", "build", "node_modules", ".dart_tool", ".venv"}
SKIP_FILES = {Path("docs/05-decisions.md"), Path("docs/done-archive.md")}
GUIDE_DIR = ROOT / "global-standards"

WIKILINK = re.compile(r"\[\[([^\]|#]+)")
MD_PATH = re.compile(r"`((?:docs/|global-standards/)?[\w.-]+\.md)`")
PROJECT_PATH = re.compile(r"`(workflow/[\w./-]*)`")
GUIDE_SECTION = re.compile(r"([A-Z_]+\.md)`?\s*((?:§[\d–-]+[,\s]*)+)")
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
CODE_SPAN = re.compile(r"`[^`]*`")


def markdown_files():
    for path in ROOT.rglob("*.md"):
        relative = path.relative_to(ROOT)
        if not SKIP_DIRS.intersection(relative.parts) and relative not in SKIP_FILES:
            yield path


def current(path, text):
    # The Done section of TODO.md keeps the paths of its dates.
    if path == ROOT / "TODO.md":
        return text.split("\n## Done", 1)[0]
    return text


def sections(guide):
    text = (GUIDE_DIR / guide).read_text()
    return set(re.findall(r"^## (\d+)\.", text, re.M))


def resolves(ref, folder):
    # A bare filename may live next to the referring file, in workflow/, in
    # docs/, in global-standards/, or at the project root (CLAUDE.md, README.md).
    if "/" in ref:
        return (ROOT / ref).exists() or (PROJECT / ref).exists()
    return any((base / ref).exists() for base in (folder, ROOT, ROOT / "docs", GUIDE_DIR, PROJECT))


def section_numbers(spec):
    numbers = []
    for start, end in re.findall(r"(\d+)(?:[–-](\d+))?", spec):
        numbers.extend(range(int(start), int(end or start) + 1))
    return numbers


def check(path):
    # Template guidance comments hold example paths, not references.
    text = HTML_COMMENT.sub("", path.read_text())
    problems = []
    for name in WIKILINK.findall(CODE_SPAN.sub("", text)):
        if not (ROOT / "docs" / f"{name.strip()}.md").exists():
            problems.append(f"[[{name}]] has no docs/{name.strip()}.md")
    for ref in MD_PATH.findall(current(path, text)):
        if not resolves(ref, path.parent):
            problems.append(f"`{ref}` does not exist")
    for ref in PROJECT_PATH.findall(current(path, text)):
        if not (PROJECT / ref).exists():
            problems.append(f"`{ref}` does not exist")
    for guide, spec in GUIDE_SECTION.findall(text):
        if not (GUIDE_DIR / guide).exists():
            continue
        missing = [n for n in section_numbers(spec) if str(n) not in sections(guide)]
        if missing:
            problems.append(f"{guide} has no section {', '.join(map(str, missing))}")
    return problems


def main():
    broken = 0
    for path in sorted(markdown_files()):
        for problem in check(path):
            print(f"{path.relative_to(PROJECT)}: {problem}")
            broken += 1
    print(f"{broken} broken reference(s)")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()

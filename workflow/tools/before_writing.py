"""Give a Claude Code session what a write needs, before its first write of that kind.

Run by the PreToolUse hook on Write and Edit in .claude/settings.json, with the hook's
JSON on stdin. A write is refused once, with everything it needs that the session has not
been given yet, so the session reads it and writes again: for a Write that creates a file,
the method paragraph of global-standards/STELLATA_DEFINITIONS.md, its three questions, once
per file; then the nearest folder readme, in the folder written in or one above it, but not
the project's own; then the writing or code guides by kind of file. It names no project's
folders, and a document that does not exist is not given, so it works in any project. A
write that needs nothing more passes; a document that is the file being written counts as
given, as the session reads a file before it edits it. Run by the SessionStart hook after
a compaction or /clear, it forgets what the session was given, so every document is given
again. Any failure gives nothing, so a fault here never stops a write.
"""

# Contents
#
# 1. The Hook
#    - main()
#    - refusal()
#    - part()
#
# 2. What a Write Needs
#    - PROJECT
#    - STANDARDS
#    - DEFINITIONS
#    - WRITING
#    - CODE
#    - CODE_SUFFIXES
#    - GUIDES
#    - needed()
#    - method()
#    - folder_readme()
#
# 3. Shown Documents
#    - SHOWN
#    - forget()
#    - already_shown()
#    - mark_shown()
#    - shown_file()

import json
import re
import sys
import tempfile
from pathlib import Path

# 1. The Hook


def main():
    try:
        hook = json.load(sys.stdin)
        session = hook["session_id"]
        if hook.get("hook_event_name") == "SessionStart":
            forget(session)
            return
        path = (PROJECT / hook["tool_input"]["file_path"]).resolve()
        creates = hook.get("tool_name") == "Write" and not path.exists()
        missing = [
            (key, document)
            for key, document in needed(path, creates)
            if not already_shown(session, key)
        ]
        needs = [(key, document) for key, document in missing if document != path]
        answer = refusal(needs, path) if needs else None
        for key, _ in missing:
            mark_shown(session, key)
        if answer is not None:
            print(json.dumps(answer))
    except Exception:
        return


def refusal(needs, path):
    """The hook's answer: deny the write, with every question and document it needs as the
    reason, in the order needed() gives them."""
    written = path.relative_to(PROJECT)
    parts = "\n\n".join(part(key, document) for key, document in needs)
    reason = (
        f"Before writing {written}, read what follows.\n\n{parts}\n\n"
        "Write again: the questions are asked once for each new file, and each document "
        "is given once in a session."
    )
    return {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }


def part(key, document):
    """One part of the reason: the method's questions for a new file, or a document."""
    if key.startswith("new:"):
        return f"The questions of {document.relative_to(PROJECT)}, for the new file:\n\n{method()}"
    return f"{document.relative_to(PROJECT)}:\n\n{document.read_text().rstrip()}"


# 2. What a Write Needs

PROJECT = Path(__file__).resolve().parent.parent.parent
STANDARDS = PROJECT / "workflow" / "global-standards"

DEFINITIONS = STANDARDS / "STELLATA_DEFINITIONS.md"

# The guides each kind of file needs, by suffix, in the order they are given. Source code
# in any common language gets the code guides; configuration and data files get none.
WRITING = ["WRITING_STYLE_GUIDE.md", "_CONTENT_HIERARCHY.md"]
CODE = ["CODE_STYLE_GUIDE.md", "_CODE_STRUCTURE.md"]
CODE_SUFFIXES = (
    ".py .js .mjs .cjs .jsx .ts .tsx .rs .go .java .kt .swift "
    ".c .h .cpp .cs .rb .php .sh"
).split()
GUIDES = {".md": WRITING} | {suffix: CODE for suffix in CODE_SUFFIXES}


def needed(path, creates):
    """What a write to the resolved path needs, in order, as (key, document) pairs.

    Nothing outside the project, and only documents that exist.
    """
    try:
        path.relative_to(PROJECT)
    except ValueError:
        return []
    found = []
    if creates and method() is not None:
        found.append((f"new:{path.relative_to(PROJECT)}", DEFINITIONS))
    readme = folder_readme(path)
    if readme is not None:
        found.append((str(readme.relative_to(PROJECT)), readme))
    for name in GUIDES.get(path.suffix, []):
        guide = STANDARDS / name
        if guide.is_file():
            found.append((str(guide.relative_to(PROJECT)), guide))
    return found


def method():
    """The paragraph of DEFINITIONS that starts "The method is", or None if there is none."""
    if not DEFINITIONS.is_file():
        return None
    for paragraph in DEFINITIONS.read_text().split("\n\n"):
        if paragraph.startswith("The method is"):
            return paragraph.strip()
    return None


def folder_readme(path):
    """The nearest README.md in a folder that holds the resolved path, or None.

    The project root's README.md describes the project, not a folder, so it is never given.
    """
    folder = path.parent
    while folder != PROJECT and folder.is_relative_to(PROJECT):
        readme = folder / "README.md"
        if readme.is_file():
            return readme
        folder = folder.parent
    return None


# 3. Shown Documents

# One file per session, listing the keys of what was already given in it.
SHOWN = Path(tempfile.gettempdir()) / "before_writing"


def forget(session):
    shown_file(session).unlink(missing_ok=True)


def already_shown(session, key):
    file = shown_file(session)
    return file.is_file() and key in file.read_text().split("\n")


def mark_shown(session, key):
    SHOWN.mkdir(exist_ok=True)
    with shown_file(session).open("a") as shown:
        shown.write(f"{key}\n")


def shown_file(session):
    """The session's file, named by its id with anything but letters, digits and - left out."""
    return SHOWN / f"{re.sub(r'[^A-Za-z0-9-]', '', session)}.txt"


if __name__ == "__main__":
    main()

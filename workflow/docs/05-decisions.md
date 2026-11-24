# 05 — Decisions

What was decided, and why. Each entry says what is in force today, since an old text left in full reads as true now. Only this file holds settled decisions.

## How an entry is written

A heading `## N. date — Name`, numbered in order, then one line per field:

**Decision:** what was chosen.
**Alternatives considered:** what else was weighed.
**Why this choice:** the reason.
**Reversible?** Yes or no, and what it would take.

A later rename adds a line `**Renamed:** date — old name to new name` to each entry that named it. When a later decision changes part of an entry, the entry is rewritten to what holds now, with a line `**Rewritten:** date, with #N: what is no longer in force`; its earlier text is in git. An entry that is replaced as a whole stays, with a line `**Replaced by:** #N`.

## 1. 2026-11-24 — The project follows wf-workflow

**Decision:** The project follows the wf-workflow template in `~/Desktop/wf-workflow`. `CLAUDE.md`, `.claude/settings.json`, `.claude/commands/review-step.md` and `workflow/` come from the template, including `global-standards/`, `REVIEW.md`, `tools/check_references.py` and `tools/before_writing.py`. `CONVENTIONS.md` and `COLLABORATION.md` are the template's versions with this project's rules merged in. The docs describe the site as it is. The old `global-standards/` at the project root is removed. The source files stay as they are, and the folders stay where they are. `_CODE_STRUCTURE.md` is not applied to the existing code.
**Alternatives considered:** Keeping `global-standards/` at the root and loading every guide from `CLAUDE.md`. Rewriting the JavaScript and CSS into Contents blocks, as the architecture portfolio did.
**Why this choice:** The template has the review step, the Stellata principle, and a hook that gives the writing and code guides before a write. The site already runs. Reshaping its files is a separate step.
**Reversible?** Yes. The moves are in git. The template itself is unchanged in `~/Desktop/wf-workflow`.

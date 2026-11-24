# Collaboration

What the project's working files are, when each is read, and how the developer and the AI work together. It is the project's answer to `global-standards/AI_COLLABORATION_GUIDE.md`, and an agreement between the two: what each can expect, not instructions to one of them.

## Contents

- Docs
- Tools
- Working style
- Before finishing

## Docs

| Question | Start with | Role |
|---|---|---|
| What is this project, and why? | `docs/00-brief.md` | Purpose and context — stable |
| What is known, and what must be found out? | `docs/01-research.md` | Findings with sources, hypotheses, open questions |
| What is being built? | `docs/02-product.md` | Scope and intent — what, not how |
| How is it built? | `docs/03-architecture.md` | Intent — verify against the code when it matters |
| What is true now? | `docs/04-current-state.md` | Orientation only — verify against the code and the running app |
| Why was it done this way? | `docs/05-decisions.md` | Settled, unless explicitly flagged |
| What is worked on, and what comes next? | `TODO.md` | Read when work starts, not at every session start |
| What might happen? | `TODO.md` § Ideas | Not decided, not built |
| Where does each part belong? | `global-standards/STELLATA.md`, `global-standards/STELLATA_DEFINITIONS.md` | The principle and the meaning of its words, with their tests and the method; the same for every project |
| How is the principle answered here? | `docs/03-architecture.md` § 1 | The project's words translated to the principle's. Its form is in `global-standards/FORM.md`: also a readme in each folder that holds more than one part |
| How is a part written? | `CONVENTIONS.md` | Agreements for writing and code; a field "Not set" follows the common default |

<!-- Rows the project adds: its own sources, such as course notes or a reference project. -->

Keep fact, hypothesis, decision and open question separate (`global-standards/AI_COLLABORATION_GUIDE.md` §5). Only `docs/05-decisions.md` holds settled decisions. If one seems wrong, say why and flag it, rather than quietly working around it.

## Tools

The checks the project runs, and when. Every rule in this file works without them; a tool makes a rule easier to keep, never what it stands on.

- `python3 workflow/tools/check_references.py` — checks that file, section and path references in the Markdown files resolve. Run it after renaming, moving or deleting a file or section. Without it, search the project for the old name (`global-standards/AI_COLLABORATION_GUIDE.md` §7).
- Optional, with hooks: `workflow/tools/before_writing.py`, run by a hook in `.claude/settings.json` before each write, gives the session the standards a file needs before it is written. Without the hook, `CLAUDE.md` loads those standards with `@` lines.
- Open the site with the Live Server extension in VS Code: right-click `index.html`, "Open with Live Server". The site uses ES modules, which do not load from `file://`, so opening the file directly does not run it.

A clean check means the tool found nothing. It does not mean the site works. Check a change a visitor would see in the browser.

## Working style

- A small fix, in one existing file, with no new behaviour and no new file, is shown in the conversation and made without an Active item. Everything else follows the steps below.
- A step starts as the Active item in `TODO.md` before the work starts: what changes, which files and folders, and which existing code it reuses. The plan is shown in the conversation and agreed first.
- Steps are planned one at a time. Before a step's work starts, it is split into small steps, in order, each naming the files it creates or changes.
- When a step creates, moves or groups files or folders, its plan asks of each part what its center is, what holds it and what it holds (`global-standards/STELLATA_DEFINITIONS.md`). It also reads the readme of each folder it touches, if it has one (`global-standards/FORM.md`).
- When a step's work is done, it is checked against the plan; a difference is either fixed or written into the plan with its reason.
- New decisions and conventions are shown in the conversation before they are written to a file.
- `main` is the published site. Pushing to it waits for a go-ahead.
- A step that changes what a visitor sees is checked in the browser.

## Before finishing

A step's last small step, after the check, is the review in `global-standards/AI_COLLABORATION_GUIDE.md` §10, over every file the step created or changed; `REVIEW.md` says how. When a Queue item is done, its last review also takes §10's look over the whole project.

If a session changes what is true about the project, `docs/04-current-state.md` is updated before the session ends (`global-standards/AI_COLLABORATION_GUIDE.md` §8).

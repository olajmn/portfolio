# Project Conventions

How a part is written in this project: agreements, not rules that follow from the principle. What a part is and where it goes is in `global-standards/STELLATA.md` and `global-standards/STELLATA_DEFINITIONS.md`, and in `global-standards/FORM.md`; how this project answers it is in `docs/03-architecture.md` § 1. Which language, framework and major dependencies the project uses is a decision, in `docs/05-decisions.md`; this file holds the rules that follow from it. Facts that change often, such as versions and which files exist, go in `docs/04-current-state.md`, not here. Each section has a default, which applies as written, and fields the project fills in when it needs them. A field that is not needed yet says "Not set." A field that says "Not set" means: follow the common default for the language and framework in use, and say which one was chosen. A choice that affects other files is asked first. Applies going forward.

## Contents

- Writing
  - Language
  - Tone
  - Neutral voice
- Code
  - Code style
  - Dependencies
  - Copied code
  - Parts that stand alone
- Naming
- Security

## Writing

### Language

- Files are written in: English (code, comments, UI text and `docs/`).
- The language rule covers files, not the conversation.

### Tone

- No emojis in the UI, docs, comments or commit messages.
- Other rules for tone: Not set.

### Neutral voice

- Comments and `docs/` state the reasoning or consequence itself, not the story of how, when or by whom it was noticed: "X breaks without Y". Dated entries keep their dates; only the voice around them stays neutral.

## Code

### Code style

- Formatter, and its settings: None (`docs/05-decisions.md` #1).
- Linter, and what must pass: None (`docs/05-decisions.md` #1). With no linter, unused functions, variables and CSS classes are found by searching the project for their names.
- Structure check (Contents block per `global-standards/_CODE_STRUCTURE.md`): Not set. The existing source is not rewritten to that structure (`docs/05-decisions.md` #1).
- No unused code: a change that leaves code unused removes it in the same change.
- Other rules for code: Plain HTML, CSS and JavaScript (ES modules), with no build step. Indentation is 4 spaces. Page content stays in `index.html`. Search for an existing function, variable or style before writing one.

### Dependencies

- A new external dependency needs a reason and a permissive license (MIT, Apache-2.0, BSD); a font needs the SIL Open Font License.
- Pinned versions, and why: No package dependencies are in use. IBM Plex Mono is loaded from Google Fonts. Helvetica Neue, Helvetica and Arial are system fonts, set as `--font` in `src/styles/base.css`. A dependency, if one is added, is pinned, and the reason is written with it.

### Copied code

- Copy only from code whose license allows it.
- The first lines of a copied file name the source, its version, and what was changed.
- Every copy updates the notices file, THIRD_PARTY_NOTICES.md at the project root, in the same change; the first copy creates it.
- Sources, and their licenses: Not set.

### Parts that stand alone

- A part that is a three (`global-standards/STELLATA_DEFINITIONS.md`, Three) can be copied out of the project and still build and pass its own tests. Without a tool, it is checked by reading its imports: it imports nothing from what holds it.
- Tool that checks it: Not set.

## Naming

- Done lines in `TODO.md` and entries in `docs/05-decisions.md` keep the names of their dates; a rename adds a Renamed line to each decision that named it.
- Project-specific naming rules: Not set.
- Tool that checks references: `python3 workflow/tools/check_references.py` (`COLLABORATION.md` § Tools).

## Security

- The repository is public, and it is the live site. No keys or private notes go in it. `CLAUDE.local.md` is listed in `.gitignore`.
- Security and privacy trade-offs are considered before an architecture, storage or sync decision is made. Every deferral is written down with its reason in `docs/05-decisions.md`.

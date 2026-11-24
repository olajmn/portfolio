# Project Instructions

The following reusable standards apply to all source code and documentation
work in this project. They are general and project-independent — see
`workflow/global-standards/` for the standalone copies.

@workflow/global-standards/AI_COLLABORATION_GUIDE.md
@workflow/global-standards/STELLATA.md
@workflow/global-standards/STELLATA_DEFINITIONS.md
@workflow/global-standards/FORM.md

The other four standards are not loaded here. With the hook in
`.claude/settings.json`, each is given before the first write of its kind in
a session; without it, load them here with `@` lines. Read them when
planning a change to such a file:

- `workflow/global-standards/WRITING_STYLE_GUIDE.md` and
  `workflow/global-standards/_CONTENT_HIERARCHY.md`, for Markdown
- `workflow/global-standards/CODE_STYLE_GUIDE.md` and
  `workflow/global-standards/_CODE_STRUCTURE.md`, for source code

Files are written with Write and Edit, not in a shell (`sed -i`, `cat >`),
so the hook sees every write.

Where a general standard conflicts with this project's own rules or
settled decisions, the project-specific files below take precedence.

@workflow/COLLABORATION.md
@workflow/CONVENTIONS.md

To review a finished step, follow `workflow/REVIEW.md`; `/review-step` is a shortcut for it.

Everything about the way of working is in `workflow/`. In those files, a
path to another workflow file is read from inside `workflow/`
(`docs/04-current-state.md`); a path to anything outside it, such as the
code or `CLAUDE.md`, from the project root.

Apply the standards above to new and modified files; do not rewrite
existing files just to conform to them.

## This project

One page, `index.html`, started by `src/main.js`. Published from `main` at https://olajmn.github.io/portfolio/.

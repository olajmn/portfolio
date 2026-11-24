# Review

How the latest changes are reviewed (`global-standards/AI_COLLABORATION_GUIDE.md` §10). Ask for it in plain words ("review today's changes") or with the shortcut `/review-step` (`.claude/commands/review-step.md`).

Review the changes and report findings. Change nothing until asked.

## 1. Scope

The scope is what changed. Check first whether the project uses git (`git rev-parse --is-inside-work-tree`); the table says how the changes are found in each case.

| Asked for | With git | Without git |
|---|---|---|
| Nothing | The uncommitted changes (`git status --short`, `git diff HEAD`); if none, the last commit (`git show --stat HEAD`) | The files changed in this session |
| A number N | The last N commits (`git diff --stat HEAD~N`) | Not possible: say so, and ask for a time instead |
| A time, such as "today" | The commits since then (`git log --since`), and the uncommitted changes | The files changed since then (`find . -newermt "<time>" -type f`) |
| All | The whole project, below | The whole project, below |

- Files git does not track, such as a workflow kept out with `.git/info/exclude`, are found by time, as without git.
- The Active item in `TODO.md`, or the last Done item, says what the changes were meant to do. It does not decide which files are reviewed.
- Read each file in full where its first line, comments, Contents block or placement must be judged. Read unchanged files only to confirm a duplicate or a reference.
- Before § 3, read the guides for the kinds of file that changed: `global-standards/WRITING_STYLE_GUIDE.md` and `global-standards/_CONTENT_HIERARCHY.md` for Markdown, `global-standards/CODE_STYLE_GUIDE.md` and `global-standards/_CODE_STRUCTURE.md` for source code.

## 2. Checks

Run the commands listed in `COLLABORATION.md` § Tools, and report only the result, or the failure with its message. If none are listed, say that no checks were run.

## 3. Questions for each file

- The seven questions in `global-standards/AI_COLLABORATION_GUIDE.md` §10.
- Does it follow `CONVENTIONS.md`: the Writing rules, and each Code field that is set?

Then: do `docs/04-current-state.md`, `docs/03-architecture.md` and `TODO.md` still match what changed? If something visible changed, the report names what to check in the running app.

**The whole project.** Asked for with "all", and taken by the last review of a Queue item (`COLLABORATION.md` § Before finishing). Instead of the questions above, each file in the project is checked for having outgrown its first line, as `global-standards/AI_COLLABORATION_GUIDE.md` §10 says: its first line is compared with its Contents block, or with its top-level declarations where it has none, and the file is read in full only where a section or declaration is not covered by the first line.

## 4. Report

Short and plain, with little jargon.

- One line: what was reviewed (the commits, the time, or the files).
- One line per check: passed, what failed, or that none were run.
- Findings, numbered, each with `file:line`, what is wrong, and the fix proposed. Keep "to fix" apart from "noticed, leave as it is", and say why for the second.
- If nothing is found, say so in one line.

End with "Shall I fix these?" Do not edit or fix before the answer.

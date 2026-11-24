# TODO

What is being worked on (**Active**), what the user has chosen to come next (**Priority**), what is decided but not started (**Queue**), what is not decided (**Ideas**), and the last finished items (**Done**). How an item moves and how it is written is at the end.

## Active

One item at a time.

## Priority

What the user has chosen to come next, one line each, in order: the first is taken next. Only the user puts an item here. The item in Active is marked `(active)`; when it is done, its line is taken out.

## Queue

Every item that is decided, with its fields, in number order. An item not in Priority waits until it is chosen.

## Ideas (not decided)

Not planned and not built. Moving one into the Queue is a deliberate choice.

- Apply the Contents-block structure to the existing source, with a checker.
- Keep `workflow/`, `CLAUDE.md` and `.claude/` out of the public repository.

## Done

Newest first. The ten newest lines give the context of what was just done; when a line is added, the oldest leaves, and older lines are found in git. Without git, a line that leaves is added at the bottom of docs/done-archive.md, which is created when the first line leaves; it is searched, not read whole.

- 1 — 2026-11-24 — Follow wf-workflow. The working files are in `workflow/`, `CLAUDE.md` and `.claude/` come from the template, and the docs describe the site as it is. The old `global-standards/` at the root is removed. Source files were not rewritten. Checked with `python3 workflow/tools/check_references.py`. Applying the Contents-block structure, and keeping the workflow out of the public repository, are left open in Ideas.

## How an item moves

Ideas → Queue → Active → Done. An item can also go back (Queue → Ideas), be split in two, or be taken into another. Each move is a deliberate choice.

An idea has no number; it is named by its name. It gets a number when it moves to Queue: one higher than every number used before, in this file or in its history (git, or the done archive). Numbers are ids, not rank, and are never used twice. An item that is dropped without being done gets a Done line that says so, so its number is never lost.

An item in Queue is put in Priority, as `- N — Name`, when the user chooses it. Priority holds only what has been chosen, not all of Queue. The item in Active stays in Priority, marked `(active)`, until it is done.

A Question is done when it is answered. A choice goes to `docs/05-decisions.md`, a finding to `docs/01-research.md`, and the Steps it leads to become items of their own.

## How an item is written

One item, as it stands in Priority once it is chosen, in Active while it is worked on, and in Done when it is finished. An example, not an item:

```
Ideas:
- Add login

Priority:
- 4 — Add login (active)

Active:
4. **Add login** (Step)
   - Status: agreed
   - From: the idea Add login

   A user logs in with email and password and gets a token back. Done when
   a protected route refuses a request without the token.

   i. The route: done. POST /login in routes/auth.js.
   ii. The token:
      a. Sign it on login: done.
      b. A middleware that checks it.
         - reads the header `Authorization: Bearer <token>`
         - answers 401 when it is missing or wrong
         - with `jsonwebtoken`, as decided in #3
      c. Use it on one route, to test.
   iii. Errors: wrong password, missing fields.
   iv. Check.
   v. Review.

Done:
- 4 — 2026-11-20 — Add login. Login works with the test user. routes/auth.js. Checked by hand, with a request to a protected route with and without the token. Logout left open, as Queue 7.
```

An item in Queue or Active has three parts, in this order: its fields (the state), a short paragraph on what it is and when it is done (the content), and its steps (the plan). A raised item needs only its name and fields; the paragraph is written when a way forward is proposed.

**The fields.** Kind and Status are always written; the other fields only when they have something in them. Each field is here so the developer and the AI see the state at once, without reading prose; a field that neither reads is taken out.

Core fields, the same in every project:

- **Kind:** Question (something to work out) or Step (something to build or change).
- **Status:** *Raised*: noticed. *Proposed*: a way forward is suggested, not agreed. *Agreed*: the user has said yes.
- **From:** where the item was raised.
- **After:** what must be finished first.
- **Open:** the questions still left inside the item. In a Question, only those under the main one, which is its name and paragraph.

Fields in this project: each project adds the fields its setting needs, below the core fields. A core field names no setting.

**The content.** What the item is, and when it is done, in a few sentences. Read to understand the item; the fields and steps are read to see where it stands.

**The plan.** The plan grows at its front. A step is planned in small steps when it is taken; until then it is one line. Inside a step or a small step, anything the work needs can grow: `-` points, notes, a short paragraph. When a step is done, it shrinks to one line: what was done, and where. What happened along the way goes in the Done line, and why a choice was made in `docs/05-decisions.md`, named by its number (#3). A Step's last steps are its checks and its review.

**The numbering.** Only the item number is a number. Inside an item, the steps are `i.`, `ii.`, `iii.`, and the small steps inside a step `a.`, `b.`, `c.`, each level indented 3 spaces (`global-standards/_CONTENT_HIERARCHY.md`). A place is then named in full, such as "4 ii. b.". A step that needs a fourth numbered level has become an item of its own: it is split out with a new number, and the old step says so ("b. The middleware: moved to 9"). In Priority and Ideas, the lines are `-`.

**An idea** is one line, `- Name`; it gets its fields when it moves to Queue.

**A Done line** is `- N — date — Name`, then what changed, where, how it was checked, and what was left open and where it went.

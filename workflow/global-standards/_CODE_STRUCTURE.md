# Code Structure

An optional add-on to `CODE_STYLE_GUIDE.md`: every source file gets the same visible, checked structure. Project-independent. A project opts in by including this file in its `CLAUDE.md` and naming its check in its conventions.

Its purpose is enforcement, not only readability: the block is a map the code must match, and a check makes the match mechanical, so code cannot drift into arbitrary places as a file grows.

It makes `CODE_STYLE_GUIDE.md` §1 stricter: every source file that declares anything besides modules and imports has a Contents block, so §1's "Skip it in small or simple files" and §6's "only if it gives a real reader navigation" do not apply.

## Contents

1. Contents Block
2. Sections
3. Order in a File
4. Checking

## 1. Contents Block

A comment after the file's first line or docstring and any file-wide directives, before the imports. It lists the file's sections, numbered, and under each every declaration a reader would look for (types, top-level functions, significant constants), by their exact names. Methods are listed only where they are the point of the section; a language without declarations, such as CSS, lists sections only.

- It shows where something is, not what it does.
- It changes in the same change as the code.
- A file that holds only module declarations and imports, such as a package's index file, has no sections and no block; its first other declaration requires both.

## 2. Sections

Each section starts, after at least one blank line (two where the formatter keeps them), with a comment carrying its number and name exactly as in the block (`// 2. Writing`, `# 2. Writing`, `/* 2. Writing */`).

- A one-section file still numbers and lists it.
- Every declaration sits in the section that lists it.
- A section holds one subject, and its name says which.
- Code used by several sections goes in the section of its subject (time formatting under time); only code without one gets its own section.
- No section exists only to fill the block.
- Sections follow the code as written: a group the language keeps together, such as a class or a block of methods, stays whole in one section, and no code is added or split to fit a section.
- No comment only repeats the name below it.

## 3. Order in a File

1. First line or docstring
2. File-wide directives, such as a lint setting for the whole file
3. Contents block
4. Imports and module declarations
5. Sections

Data (types, constants, variables) is declared above the functions that use it, where the language allows. A type comes before the types it is built from, as a caller comes before what it calls.

Sections read top-down: a section comes before the sections whose functions it calls.

Within a section, functions read top-down: those that nothing in the file calls come first, in the order a reader needs them; the rest follow in the order they are first called, reading from the top.

Lines a language fixes in place, such as a module attribute, stay there.

## 4. Checking

The project's named tool or test fails when:

- a source file that declares anything besides modules and imports has no Contents block;
- the file's sections and the block's differ in number, name or order;
- a listed declaration is outside its section, or a top-level declaration is unlisted.

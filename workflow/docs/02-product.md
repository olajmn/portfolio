# 02 — Product

What is being built: what, not how. How it is built is in `03-architecture.md`; what is still unknown is in `01-research.md`.

## 1. What it does

One page, `index.html`, with five sections.

- **Home.** The name, and the word "portfolio" under it. Clicking the name toggles night mode, the same as the button in the navbar.
- **About.** A short description and a portrait. The lines fade as they move through the middle of the screen.
- **Projects.** Two cards. Project 1 links to its demo and its repository, and shows a password the visitor can copy. The Architecture Portfolio card cross-fades through images of the work and links to that site.
- **Education.** Four programmes, newest first.
- **Contact.** An email address, and links to GitHub and LinkedIn.

The navbar stays fixed and links to each section. The section headings type themselves in when they enter the view. Night mode turns the page dark and shows a particle scene on the canvas behind it. In night mode, a click sends a colour wave through the particles.

## 2. Principles

- The page is the content: a change to a project, a school or the contact details is a change to `index.html`.
- Nothing is built before the browser sees it. There is no build step.

## 3. First version

The published page in § 1.

## 4. Later

Undecided ideas are in `TODO.md` § Ideas. The Passage image sits in `assets/images/architecture/` and is commented out of the carousel in `index.html`.

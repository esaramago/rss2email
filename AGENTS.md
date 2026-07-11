# Guidelines for AI agents

This file provides guidance to AI coding agents working in this repository.
The [README](README.md) provides more context and instructions.

## Core rules
- Comments should be in english.
- Use `pnpm` for repo commands.
- Do not change `.env` file
- Keep changes scoped to the request and the affected package. Do not refactor unrelated code.
- Respect existing worktree changes. Do not revert user changes unless explicitly asked.
- Use sentence case for headings, titles, labels, and documentation text.

## Code conventions
- Tab size is 2 spaces.
- Use spaces instead of tabs.

### JavaScript
- Follow existing file-local style and abstractions.
- Use workspace types and helpers rather than duplicating definitions.
- Do not use semicolons in the end of statements.
- Use single quotes for strings.

## Project structure
- `data`: contains:
  - `feeds.json`: contains the feeds to be sent.
  - `settings.json`: contains the settings for the project.
- `src`: contains:
  - `helpers`: contains helper functions.
  - `index.js`: contains the main logic for the project.
  - `main.js`: contains the main class for the project.
  - `template.html.js`: contains the HTML template for the email.

## DevOps
- The project is hosted in Coolify.
- The project uses Docker for deployment.

## Stack
- Node.js
<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Instructions

## Common Instructions

- Chat responses should be given in Japanese, concisely and politely.
- All documents (design documents, source files, comments, etc.) should be written in English unless otherwise instructed.

## Tool Usage Policy

- Always use Ultracite rule from mcp server.
- Always utilize the Serena MCP server as the primary tool for semantic code search, project analysis, and automated refactoring.
- Upon project initialization, activate the current directory as a Serena project before performing any operations.
- Prefer Serena tools over built-in commands whenever semantic understanding of the codebase is required.


## TypeScript Guidelines

- File Naming: Use kebab-case for all file names.
- Functions: Prefer arrow functions (`const fn = () => {}`) over function declarations.
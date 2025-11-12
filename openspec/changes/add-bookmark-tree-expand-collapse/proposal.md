## Why
When Tree view mode is active, all folders are collapsed by default. Users who want to see all bookmarks at once must manually expand each folder, which becomes tedious when dealing with multiple nested folders. A single-button toggle that expands or collapses all folders based on current state improves navigation efficiency.

## What Changes
- Add a toolbar button in the BOOKMARKS view title area that toggles all folder nodes between collapsed and expanded states.
- Implement smart toggle behavior: if any folder is currently expanded, collapse all folders; if all folders are collapsed, expand all folders.
- Use VS Code standard icons (e.g., `chevron-down` for collapse, `unfold` for expand) to indicate the current action.
- The toggle state is session-scoped only (no persistence across VS Code restarts).
- Reset folder collapse states to default when switching between Tree and Flat view modes.
- Preserve collapse states when bookmarks are added, deleted, or reordered during the same session.

## Impact
- Affected specs: explorer-bookmarks
- Affected code:
  - TreeView title/menu contributions for the new toolbar button
  - Command handler for expand/collapse all logic
  - Tree data provider to manage and expose collapsible state tracking
  - View mode switching logic to reset collapse states

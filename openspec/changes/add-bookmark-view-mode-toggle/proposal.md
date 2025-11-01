## Why
The BOOKMARK view only shows a flat list of saved resources, so users cannot quickly navigate nested folders when bookmarks span multiple directories. Aligning the experience with VS Code’s Source Control view (tree vs. list) enables large bookmark sets to stay organized and discoverable.

## What Changes
- Add a header control beside the BOOKMARK view title with “View as List” and “View as Tree” buttons that mirror the Source Control experience.
- Keep the existing flat list behavior when “View as List” is selected and make it the default mode.
- Introduce a tree-rendering mode that groups bookmarks by their ancestor folders, showing expandable folder nodes on demand.
- Persist the selected view mode per user so the preference sticks across reloads.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: TreeView title/menu contributions, view toolbar command handlers, bookmark tree data provider, storage utilities for persisted view mode, React/webview tree rendering logic

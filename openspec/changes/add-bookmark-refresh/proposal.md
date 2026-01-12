## Why

Bookmarks are stored in globalState and shared across all VS Code windows. When bookmarks are updated in another project/window, the current window does not reflect those changes until the extension is reloaded. Users need a way to manually refresh the bookmark list to see updates made elsewhere.

## What Changes

- Add a "Refresh" button to the Bookmarks view toolbar
- Place the button to the right of the existing "Clear All" button
- When clicked, reload bookmark data from globalState and update the tree view

## Impact

- Affected specs: bookmark-management
- Affected code:
  - `src/bookmarks/bookmark-store.ts` - Add refresh method
  - `src/commands/refresh-bookmarks.ts` - New command handler
  - `src/extension.ts` - Register new command
  - `package.json` - Add command and menu contribution

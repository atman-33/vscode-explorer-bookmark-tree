## Why
The extension currently ships boilerplate sample commands and webviews, so users cannot bookmark Explorer resources. Explorer Bookmark Tree needs a real workflow so people can save and reopen frequently used files or folders directly inside a native VS Code tree view.

## What Changes
- Add an Explorer context menu command (e.g., `Add to Explorer Bookmark Tree`) for files and folders that pushes the selected resource into the bookmark list
- Persist bookmarks in a user-scoped storage area (outside the workspace) so entries survive reloads without polluting the repository
- Surface the bookmarks via a dedicated `TreeView` backed by a `TreeDataProvider`, keeping its nodes synchronized with the stored list
- Open the target resource when a bookmark item is activated in the tree view

## Impact
- Affected specs: explorer-bookmarks
- Affected code: package.json contributions, src/extension.ts, new bookmark command + storage utilities, bookmark tree data provider module

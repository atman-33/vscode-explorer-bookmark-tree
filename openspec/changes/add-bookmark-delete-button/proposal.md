## Why
Users can add bookmarks to the Explorer Bookmark Tree but cannot remove them without editing persisted state manually. Introducing a first-class delete control keeps the tree manageable and avoids stale bookmarks cluttering the view.

## What Changes
- Contribute an inline delete command to the BOOKMARKS TreeView so a codicon “x” button appears on hover beside each bookmark item.
- Implement the command to remove the targeted bookmark entry via the extension, updating persistence and raising change events.
- Extend the bookmark storage utilities to support removing entries and emitting change events that keep the tree synchronized.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: package.json view/item contributions, TreeView command handling, bookmark storage utilities, tree data provider refresh handling

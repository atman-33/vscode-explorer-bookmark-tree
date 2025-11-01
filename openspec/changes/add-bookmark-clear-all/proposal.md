## Why
Clearing bookmarks requires deleting entries one-by-one, which is tedious when users want to reset or clean the BOOKMARKS list. A single control to remove everything keeps the tree manageable without manual repetition.

## What Changes
- Add a “Clear All” header control beside the existing view mode toggle in the BOOKMARKS title area so the action is always discoverable.
- Implement a command that wipes the persisted bookmark collection, raises the usual change events, and refreshes the TreeView immediately with an empty state.
- Ensure the clear operation is immediate with no confirmation dialog while remaining undoable via VS Code’s native global undo history if available.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: TreeView title/menu contributions, clear-all command handler, bookmark storage utilities, tree data provider refresh logic

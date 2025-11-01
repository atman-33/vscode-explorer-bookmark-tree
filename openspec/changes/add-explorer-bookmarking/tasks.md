## 1. Implementation
- [x] 1.1 Replace boilerplate commands with a `bookmarkExplorerItem` command that accepts an Explorer selection and persists it via a storage helper.
- [x] 1.2 Register the command as a `explorer/context` menu item labeled "Add to Explorer Bookmark Tree" and guard it to fire for files and folders only.
- [x] 1.3 Create a bookmark store module that uses `ExtensionContext.globalState` to load, save, and notify listeners of bookmark changes.
- [x] 1.4 Implement a `TreeDataProvider` that reads from the bookmark store, emits refresh events, and register it as the Explorer Bookmark Tree view.
- [x] 1.5 Implement click handling so selecting a tree item opens or reveals the associated resource via VS Code commands.

## 2. Validation
- [x] 2.1 Add unit coverage for the storage helper to confirm add + load flows and URI parsing.
- [x] 2.2 Exercise the `TreeDataProvider` in tests to ensure it returns the expected items and refreshes after updates.
- [x] 2.3 Manually validate in VS Code: add a file and folder bookmark, confirm persistence across reload, and confirm the tree view opens each resource correctly.

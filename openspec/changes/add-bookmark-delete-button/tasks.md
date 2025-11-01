## 1. Implementation
- [x] 1.1 Contribute an `explorerBookmarkTree.deleteBookmark` command and expose it as a `view/item/context` menu entry with `group: inline` and a close codicon.
- [x] 1.2 Implement the command handler to receive the target bookmark, call the store’s remove logic, and surface errors to the user.
- [x] 1.3 Extend the bookmark store utilities to remove entries, persist the new list, and notify listeners so the TreeView refreshes automatically.

## 2. Validation
- [x] 2.1 Add unit coverage for the bookmark store delete path to confirm persistence and event emission.
- [x] 2.2 Add a provider/command test double to ensure the delete command removes the correct entry and triggers a refresh.
- [x] 2.3 Manually validate in VS Code: delete file and folder bookmarks via the inline button and confirm they disappear immediately and stay removed after reload.

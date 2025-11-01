## 1. Implementation
- [ ] 1.1 Contribute view toolbar commands beside the BOOKMARK title to switch between list and tree modes, matching VS Code’s Source Control UI.
- [ ] 1.2 Extend the bookmark data provider (and webview renderer if applicable) to switch layouts based on the selected mode, defaulting to list.
- [ ] 1.3 Build tree-mode grouping that derives shared ancestor folders, creates expandable folder nodes, and updates when bookmarks change.
- [ ] 1.4 Persist the user’s chosen mode outside the workspace and restore it during activation so the view reopens with their preference.

## 2. Validation
- [ ] 2.1 Unit-test the mode persistence helper to ensure it saves, restores, and notifies listeners correctly.
- [ ] 2.2 Add provider-level coverage (or integration test) verifying both list and tree renderers receive the expected data structures.
- [ ] 2.3 Manually verify in VS Code: toggle between modes from the header, expand/collapse folders in tree mode, and confirm the selected mode survives reload.

## 1. Implementation
- [x] 1.1 Extend the BOOKMARKS list renderer to support drag-and-drop gestures for reorder operations on folders and files.
- [x] 1.2 Update the bookmark data provider and storage utilities to reorder entries in memory and persist the new sequence after a successful drop.
- [x] 1.3 Ensure tree mode reflects the custom order when resolving child nodes so list and tree stay in sync.

## 2. Validation
- [x] 2.1 Unit-test the reordering helper to confirm new positions are persisted and emitted to listeners.
- [x] 2.2 Add coverage (unit or integration) that drag-and-drop events yield the expected list order in the view model.
- [x] 2.3 Manually verify in VS Code: drag items within list mode, reload the window, and confirm both list and tree modes honor the updated order.

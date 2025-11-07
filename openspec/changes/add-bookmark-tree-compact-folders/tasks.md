## 1. Implementation
- [x] 1.1 Extend the bookmark tree data builder to detect linear folder chains with no direct bookmark items.
- [x] 1.2 Produce compacted folder nodes whose label reflects the collapsed segment (e.g., `webview-ui/src/`).
- [x] 1.3 Preserve expand/collapse behavior by splitting compacted segments when their terminal folder contains multiple children or bookmark leaves.
- [x] 1.4 Verify related interactions (drag-and-drop, context actions) continue working with compacted nodes.

## 2. Validation
- [x] 2.1 Add unit coverage for the tree data provider ensuring compact chains render as a single node and mixed branches remain unaffected.
- [x] 2.2 Add regression tests for restoring tree state after switching between list and tree view modes.
- [x] 2.3 Manual check: populate bookmarks with nested folders, confirm the tree matches VS Code Source Control compact folder behavior, and that expanding the compact node shows the expected children.

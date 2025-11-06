## Why
Tree mode currently renders every directory level as a dedicated node. When a bookmark path contains many intermediate folders with no sibling files or folders, the tree becomes deep and difficult to scan. Collapsing chains of empty folders into a single row mirrors VS Code's Source Control tree, saving vertical space and aligning with familiar UX patterns.

## What Changes
- Detect compactable directory chains (folders that only contain a single child folder and no bookmarked files) when composing tree nodes.
- Render compacted folders using a single logical node whose label concatenates the collapsed segment (for example `webview-ui/src/`).
- Ensure expansion toggles still work when a compacted node leads to a folder that finally contains multiple children or bookmark leaves.
- Persist the compacted representation across refreshes and view state restore so the tree remains stable between sessions.

## Impact
- Affected specs: explorer-bookmarks
- Affected code:
  - Tree data provider responsible for building hierarchical bookmark nodes
  - Any folder node view models shared with the webview tree renderer
  - Potential adjustments to drag-and-drop logic if paths rely on per-folder nodes

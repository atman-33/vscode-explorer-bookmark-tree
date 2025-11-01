## Context
Explorer Bookmark Tree currently exposes only boilerplate views and commands. We need to replace them with a workflow that lets users bookmark Explorer resources, keep those bookmarks persisted, and surface them inside a native VS Code tree view instead of the boilerplate webview.

## Goals / Non-Goals
- Goals: provide a context menu command to add bookmarks, persist bookmark metadata outside the workspace, hydrate a `TreeView` with the stored list, and open resources from bookmark selections.
- Non-Goals: editing or reordering bookmarks, syncing across machines, or surfacing removal/rename logic.

## Decisions
- Decision: Store bookmark entries in `ExtensionContext.globalState` under a namespaced key as JSON. This keeps data per-user/per-machine while avoiding repository files.
  - Alternatives considered: keeping data in workspaceState (would scope to workspace only) or writing a dotfile into the repo. Both fail persistence or repo cleanliness requirements.
- Decision: Represent bookmarks as an array of `{ uri, type, label }` objects where `uri` is a VS Code `Uri` string. This makes it simple to reopen resources and to distinguish folders vs files for UI rendering.
  - Alternatives: store minimal strings and derive metadata on demand, but that would require repeated `stat` calls and degrade UX.
- Decision: Implement a bespoke `TreeDataProvider` to back the `TreeView`, emitting events when the underlying bookmark list changes. This keeps rendering logic inside the extension host and avoids maintaining a React-based webview.
  - Alternatives: continue with a webview; we rejected this because the scenario only needs basic tree semantics that the TreeView API already covers.
- Decision: Reuse the helper emitter from the store (or `TreeDataProvider` refresh event) to keep the tree view in sync whenever bookmarks change. This eliminates cross-process message handling and keeps state localized.

## Risks / Trade-offs
- Bookmark data corruption if we never validate stored URIs. Mitigation: discard entries that fail to parse into a `Uri` before exposing them to the tree view.
- The tree view will not appear if the contribution is misconfigured. Mitigation: add an automated test asserting the command registration and manually verify the view appears in the Activity Bar.
- Opening folders via `vscode.openFolder` changes the workspace. Mitigation: use `revealInExplorer` for folders and `vscode.open` for files.

## Migration Plan
- Ship as additive functionality; existing boilerplate commands can be removed or left intact temporarily without breaking current users.
- No data migration is required because this introduces the first persisted state.

## Open Questions
- Should we expose a removal action within this iteration? For now we will defer until user feedback requests it.

## Why
Users who curate large bookmark collections in the BOOKMARKS view need control over display order. Today list mode locks items to their original insertion order, forcing manual removal and re-adding to reprioritize, which is slow and error prone.

## What Changes
- Enable drag-and-drop reordering for bookmark folders and files while list mode is active in the BOOKMARKS view.
- Persist the updated order immediately after a drag completes so the list reflects the new sequence across reloads.
- Surface visual drop affordances (placeholder or highlight) that mirror VS Code list behavior to make the new order obvious before dropping.
- Ensure tree mode continues to group by folders while respecting any custom order saved from list rearrangements.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: bookmark tree data provider, drag-and-drop registration in the view, bookmark storage utilities, React list renderer, tests covering persistence and ordering logic

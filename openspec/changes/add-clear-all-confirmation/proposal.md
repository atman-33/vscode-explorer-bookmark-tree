## Why
Users can accidentally trigger the BOOKMARKS "Clear All" control and lose all saved entries without notice. Adding an explicit confirmation prevents accidental data loss while keeping the action available.

## What Changes
- Prompt the user with a VS Code warning confirmation when the Clear All button is pressed in the BOOKMARKS view.
- Proceed with clearing bookmarks only when the user explicitly chooses the affirmative action; cancel otherwise with no side effects.
- Keep the confirmation visible on every Clear All attempt (no "do not ask again" option) to ensure deliberate intent.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: clear-all command handler, bookmark tree header contribution, notification utilities (if reused)

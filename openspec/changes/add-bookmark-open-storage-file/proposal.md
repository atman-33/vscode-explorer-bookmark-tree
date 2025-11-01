## Why
Users sometimes need to inspect the persisted bookmark entries to troubleshoot or back up their data, but the extension currently provides no direct way to open the underlying storage file from the BOOKMARKS view.

## What Changes
- Add a new `explorerBookmarkTree.openBookmarkStorageFile` command contributed to the BOOKMARKS view title with `navigation@0` so the control appears to the left of the existing view-mode toggle buttons, using a file-open codicon and the tooltip “Open Bookmark Storage”.
- Implement the command to resolve the bookmarks persistence file via `Uri.joinPath(context.globalStorageUri, "globalState.json")`, opening it with `workspace.openTextDocument` and `window.showTextDocument`; surface an information message if the file cannot be found or opened.
- Register the command during activation and ensure the button is only visible when the BOOKMARKS view is active.

## Impact
- Affected specs: explorer-bookmarks
- Affected code: `package.json` view/title contributions, new command module for opening the storage file, extension activation wiring, command tests validating the behavior

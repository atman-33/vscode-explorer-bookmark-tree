## Why
When users collaborate with AI or teammates they often need to share the absolute paths of their bookmarked files. Copying each entry manually from the BOOKMARKS tree is repetitive. A single control that copies every bookmark path keeps the workflow fast and consistent.

## What Changes
- Add a BOOKMARKS header "Copy Paths" button positioned immediately to the left of the existing "View as Tree/List" toggle.
- Implement a command that collects every bookmark entry (files and folders) as absolute filesystem paths and copies them to the clipboard, separated by newlines.
- Disable the button when no bookmarks exist to avoid producing empty output.

## Impact
- Affected specs: explorer-bookmarks
- Affected code:
  - Command contribution/handler for the copy action
  - Title area menu contribution for the BOOKMARKS view
  - Bookmark store accessor that returns absolute paths in a stable order
  - Clipboard and notification utilities if needed for acknowledgement

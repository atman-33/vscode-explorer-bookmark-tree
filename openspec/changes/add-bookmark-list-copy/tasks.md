## 1. Implementation
- [x] 1.1 Contribute `explorerBookmarks.copyAll` command that gathers every bookmark's absolute path.
- [x] 1.2 Add BOOKMARKS title area button "Copy Paths" (left of view mode toggle) bound to the command.
- [x] 1.3 Ensure the command copies newline-delimited absolute paths to the clipboard.
- [x] 1.4 Disable the button/command when the bookmark store is empty.
- [x] 1.5 Provide optional toast or status message confirming copy success (if consistent with UX guidelines).

## 2. Validation
- [x] 2.1 Unit tests for the command ensuring it returns absolute paths (files and folders) and respects empty store.
- [x] 2.2 Command-level test verifying the enablement context toggles with bookmark count.
- [x] 2.3 Manual check: add sample bookmarks, trigger copy, and confirm clipboard content with newline-separated absolute paths.

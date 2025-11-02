## 1. Implementation
- [ ] 1.1 Contribute `explorerBookmarks.copyAll` command that gathers every bookmark's absolute path.
- [ ] 1.2 Add BOOKMARKS title area button "Copy Paths" (left of view mode toggle) bound to the command.
- [ ] 1.3 Ensure the command copies newline-delimited absolute paths to the clipboard.
- [ ] 1.4 Disable the button/command when the bookmark store is empty.
- [ ] 1.5 Provide optional toast or status message confirming copy success (if consistent with UX guidelines).

## 2. Validation
- [ ] 2.1 Unit tests for the command ensuring it returns absolute paths (files and folders) and respects empty store.
- [ ] 2.2 Provider-level test verifying title button enablement toggles with bookmark count.
- [ ] 2.3 Manual check: add sample bookmarks, trigger copy, and confirm clipboard content with newline-separated absolute paths.

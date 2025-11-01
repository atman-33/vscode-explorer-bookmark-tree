## 1. Implementation
- [x] 1.1 Contribute a BOOKMARKS header “Clear All” button positioned to the right of the existing view mode toggle.
- [x] 1.2 Wire the button to a new clear-all command that deletes every stored bookmark and emits the usual change notifications.
- [x] 1.3 Update the tree data provider (and any webview renderer, if present) to refresh immediately to an empty state after the clear completes.
- [x] 1.4 Ensure storage utilities persist the cleared state so the BOOKMARKS view stays empty after reload.

## 2. Validation
- [x] 2.1 Add automated coverage for the storage layer verifying that the clear-all command removes all entries and notifies listeners once.
- [x] 2.2 Add integration or provider-level coverage confirming the BOOKMARKS view re-renders empty after the clear action.
- [ ] 2.3 Manually verify in VS Code: populate several bookmarks, click “Clear All,” observe immediate removal without a confirmation dialog, and confirm persistence across reload.

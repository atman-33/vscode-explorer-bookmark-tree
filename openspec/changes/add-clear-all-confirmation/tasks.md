## 1. Implementation
- [ ] 1.1 Update the BOOKMARKS clear-all command to display a VS Code warning confirmation with "Yes" and "Cancel" actions.
- [ ] 1.2 Execute the existing clear-all flow only when the user selects "Yes"; ensure the command exits early without side effects on "Cancel".
- [ ] 1.3 Centralize the confirmation message text so it can be localized or reused consistently across the extension.

## 2. Validation
- [ ] 2.1 Add automated coverage for the clear-all command verifying the confirmation prompt and both confirm/cancel paths.
- [ ] 2.2 Manually verify in VS Code: attempt to clear bookmarks, confirm the dialog appears with "Yes" and "Cancel", and ensure bookmarks remain when cancelled.

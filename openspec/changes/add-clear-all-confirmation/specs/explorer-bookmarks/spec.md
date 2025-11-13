## MODIFIED Requirements
### Requirement: Clear All Bookmarks
The BOOKMARKS view SHALL expose a header control that clears every stored bookmark in a single action only after the user confirms the intent via a VS Code confirmation prompt.

#### Scenario: Confirm before clearing
- **GIVEN** the BOOKMARKS view shows one or more bookmarks
- **WHEN** the user clicks the "Clear All" header button
- **THEN** the extension SHALL display a confirmation prompt with "Yes" and "Cancel" actions
- **AND** the extension SHALL delete every stored bookmark entry only when the user selects "Yes"
- **AND** the extension SHALL perform no data changes when the user selects "Cancel"

#### Scenario: Persist cleared state
- **GIVEN** the user confirmed the clear-all prompt by selecting "Yes"
- **WHEN** VS Code reloads and the extension reinitializes
- **THEN** the stored bookmark list SHALL remain empty
- **AND** the BOOKMARKS view SHALL render without any bookmarks until new ones are added

#### Scenario: Prompt on every attempt
- **GIVEN** the user has previously confirmed or cancelled the clear-all prompt
- **WHEN** the user clicks the "Clear All" header button again
- **THEN** the extension SHALL display the confirmation prompt again
- **AND** the prompt SHALL NOT offer a "Do not ask again" or equivalent bypass option

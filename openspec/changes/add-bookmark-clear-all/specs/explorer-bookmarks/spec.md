## ADDED Requirements
### Requirement: Clear All Bookmarks
The BOOKMARKS view SHALL expose a header control that clears every stored bookmark in a single action without prompting for confirmation.

#### Scenario: Activate clear control
- **GIVEN** the BOOKMARKS view shows one or more bookmarks
- **WHEN** the user clicks the “Clear All” header button
- **THEN** the extension SHALL delete every stored bookmark entry
- **AND** the BOOKMARKS view SHALL refresh immediately to show an empty state
- **AND** the action SHALL complete without displaying a confirmation dialog

#### Scenario: Persist cleared state
- **GIVEN** the user cleared all bookmarks via the header control
- **WHEN** VS Code reloads and the extension reinitializes
- **THEN** the stored bookmark list SHALL remain empty
- **AND** the BOOKMARKS view SHALL render without any bookmarks until new ones are added

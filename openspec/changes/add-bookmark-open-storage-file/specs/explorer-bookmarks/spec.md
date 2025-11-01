## ADDED Requirements
### Requirement: Open Bookmark Storage File
The BOOKMARKS view SHALL provide a title-bar control that opens the persisted bookmark storage file for inspection.

#### Scenario: Show storage button on BOOKMARKS view
- **GIVEN** the BOOKMARKS TreeView is visible
- **WHEN** the title bar renders its navigation controls
- **THEN** a button with the file-text codicon SHALL appear to the left of the view-mode toggle
- **AND** the control SHALL expose the tooltip text “Open Bookmark Storage”

#### Scenario: Open storage file successfully
- **GIVEN** the bookmark storage file exists in the extension’s global storage
- **WHEN** the user activates the title-bar button
- **THEN** the extension SHALL open the storage file in an editor with preview mode enabled

#### Scenario: Storage file missing
- **GIVEN** the bookmark storage file is absent
- **WHEN** the user activates the title-bar button
- **THEN** an information message SHALL state “Bookmark storage file was not found.”

#### Scenario: Storage file cannot be opened
- **GIVEN** the storage file exists but VS Code cannot read it
- **WHEN** the user activates the title-bar button
- **THEN** an information message SHALL state “Bookmark storage file could not be opened.”

## ADDED Requirements

### Requirement: Bookmark Refresh

The extension SHALL provide a refresh command that reloads bookmark data from persistent storage and updates the tree view to reflect the current state.

#### Scenario: User refreshes bookmarks after external update

- **WHEN** the user clicks the Refresh button in the Bookmarks view toolbar
- **THEN** the extension reloads all bookmarks from globalState
- **AND** the tree view updates to display the current bookmark list

#### Scenario: Refresh button placement

- **WHEN** the Bookmarks view is displayed
- **THEN** a Refresh button with the $(refresh) icon SHALL be visible in the view toolbar
- **AND** the button SHALL be positioned to the right of the Clear All button

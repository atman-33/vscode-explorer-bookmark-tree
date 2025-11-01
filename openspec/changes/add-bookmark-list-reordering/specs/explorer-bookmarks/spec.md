## ADDED Requirements
### Requirement: Reorder Bookmarks In List View
The Explorer Bookmark Tree list mode SHALL allow users to reorder bookmarks via drag-and-drop while keeping the preferred order persisted.

#### Scenario: Drag within list mode
- **GIVEN** the BOOKMARKS view is in list mode with at least two bookmarks
- **WHEN** a user drags a bookmark and drops it at a new position
- **THEN** the view SHALL update immediately to show the bookmark in its new place
- **AND** the extension SHALL persist the reordered list so subsequent refreshes render the same order

#### Scenario: Restore custom order
- **GIVEN** bookmarks were manually reordered in list mode and VS Code restarts
- **WHEN** the BOOKMARKS view reloads in either list or tree mode
- **THEN** the extension SHALL load the saved custom order
- **AND** both list and tree renderers SHALL respect that order for all bookmarks and folders

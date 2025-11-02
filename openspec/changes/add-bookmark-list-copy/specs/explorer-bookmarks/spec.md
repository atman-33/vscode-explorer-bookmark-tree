## ADDED Requirements
### Requirement: Copy Bookmark Paths
The BOOKMARKS view SHALL provide a title bar control that copies every bookmark entry as newline-delimited absolute filesystem paths without modifying stored bookmarks.

#### Scenario: Copy all via header control
- **GIVEN** one or more bookmarks exist in the BOOKMARKS view
- **WHEN** the user presses the "Copy Paths" control to the left of the view mode toggle
- **THEN** the extension SHALL copy each bookmark path to the clipboard as absolute filesystem paths separated by newline characters

#### Scenario: Disabled when empty
- **GIVEN** there are zero bookmarks stored
- **THEN** the "Copy Paths" control SHALL be disabled or hidden

#### Scenario: Folder and file support
- **GIVEN** bookmarks may point to files or folders
- **WHEN** the paths are copied
- **THEN** each entry SHALL reflect the absolute path to that resource using the platform's path separators

#### Scenario: Stable ordering
- **GIVEN** bookmarks are displayed in the BOOKMARKS tree order
- **WHEN** the user copies paths
- **THEN** the clipboard content SHALL list paths in the same order as presented in the tree

## ADDED Requirements
### Requirement: Delete Bookmark Entry
The Explorer Bookmark Tree SHALL expose an inline TreeView command that lets users remove individual bookmarks without restarting VS Code.

#### Scenario: Delete file bookmark with hover button
- **GIVEN** a file bookmark appears in the BOOKMARKS tree
- **WHEN** the user hovers the row and clicks the inline delete codicon button
- **THEN** the bookmark SHALL be removed from the stored list
- **AND** the tree view SHALL refresh so the entry disappears immediately

#### Scenario: Delete folder bookmark with hover button
- **GIVEN** a folder bookmark appears in the BOOKMARKS tree
- **WHEN** the user hovers the row and clicks the inline delete codicon button
- **THEN** the bookmark SHALL be removed from the stored list
- **AND** the tree view SHALL refresh so the entry disappears immediately

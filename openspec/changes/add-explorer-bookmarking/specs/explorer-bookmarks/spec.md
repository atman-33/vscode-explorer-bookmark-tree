## ADDED Requirements
### Requirement: Bookmark Explorer Item
The extension SHALL expose an Explorer context menu command that bookmarks a selected file or folder and pushes the entry into the bookmark list.

#### Scenario: Add file via context menu
- **GIVEN** a file is selected in the Explorer
- **WHEN** the user invokes "Add to Explorer Bookmark Tree"
- **THEN** the extension SHALL capture the file URI with a label and append it to the bookmark list
- **AND** the Explorer Bookmark Tree TreeView SHALL refresh so the new bookmark appears

#### Scenario: Add folder via context menu
- **GIVEN** a folder is selected in the Explorer
- **WHEN** the user invokes "Add to Explorer Bookmark Tree"
- **THEN** the extension SHALL capture the folder URI with a label and append it to the bookmark list
- **AND** the Explorer Bookmark Tree TreeView SHALL refresh so the new bookmark appears

### Requirement: Persist Bookmarks
The extension SHALL store bookmark entries in user-scoped extension storage so they survive VS Code reloads without creating files inside the workspace.

#### Scenario: Restore bookmarks after reload
- **GIVEN** bookmarks exist for the current user
- **WHEN** VS Code restarts and the Explorer Bookmark Tree TreeView is shown
- **THEN** the extension SHALL load the stored entries from user-scoped storage
- **AND** the TreeView SHALL render the restored bookmarks without requiring repository files

### Requirement: Render Bookmark Tree
The Explorer Bookmark Tree TreeView SHALL render the current bookmark list and keep it synchronized with extension-side updates.

#### Scenario: Render synced list
- **GIVEN** the tree data provider supplies the current bookmark list
- **WHEN** the TreeView loads or receives a refresh event
- **THEN** it SHALL display each bookmark with its saved label and distinguish files from folders when rendering

### Requirement: Open Bookmark Resource
The Explorer Bookmark Tree TreeView SHALL open the matching VS Code resource when a bookmark is activated.

#### Scenario: Open resource from view
- **GIVEN** a bookmark representing a file or folder is displayed
- **WHEN** the user selects the bookmark in the TreeView
- **THEN** the extension SHALL invoke the appropriate VS Code command to open the resource in the editor or reveal the folder

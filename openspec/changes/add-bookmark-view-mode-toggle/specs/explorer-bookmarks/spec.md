## ADDED Requirements
### Requirement: Toggle Bookmark View Mode
The BOOKMARK view SHALL expose a single toolbar control beside its title that toggles between “View as List” and “View as Tree”, defaulting to list mode.

#### Scenario: Display the alternate mode control
- **GIVEN** the BOOKMARK view is visible
- **WHEN** the view header renders while list mode is active
- **THEN** it SHALL show a “View as Tree” control and hide “View as List”
- **AND** when tree mode becomes active the header SHALL instead show “View as List”

#### Scenario: Restore preferred mode
- **GIVEN** the user previously selected “View as Tree”
- **WHEN** VS Code reloads and the BOOKMARK view initializes
- **THEN** the extension SHALL reactivate “View as Tree” automatically
- **AND** the view content SHALL render using tree mode without requiring another toggle

### Requirement: Render Bookmark Tree Mode
When “View as Tree” is active, the BOOKMARK view SHALL organize bookmarked items into a hierarchical tree whose root nodes represent the highest ancestor folders shared by the saved entries, with expandable folders that reveal their descendants on demand.

#### Scenario: Compose ancestor-based hierarchy
- **GIVEN** bookmarks exist for `/repo/src/index.ts` and `/repo/docs/guide.md`
- **WHEN** “View as Tree” is selected
- **THEN** the view SHALL surface `/repo/` as the top-level folder node
- **AND** it SHALL show `src/index.ts` and `docs/guide.md` under the appropriate folder branches

#### Scenario: Expand and collapse folders
- **GIVEN** “View as Tree” is active and a folder node is collapsed
- **WHEN** the user activates the folder node
- **THEN** the node SHALL expand to show its child folders and bookmarks
- **AND** activating the node again SHALL collapse its children without removing them from the backing store

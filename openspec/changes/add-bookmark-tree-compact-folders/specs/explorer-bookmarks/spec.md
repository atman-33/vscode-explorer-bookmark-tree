## MODIFIED Requirements
### Requirement: Render Bookmark Tree Mode
When “View as Tree” is active, the BOOKMARK view SHALL organize bookmarked items into a hierarchical tree whose root nodes represent the highest common ancestor folder shared by the saved entries, with expandable folders that reveal their descendants on demand, and SHALL compact consecutive folder levels that contain no sibling bookmarks or folders into a single displayed node labeled with the collapsed segment.

#### Scenario: Compose ancestor-based hierarchy
- **GIVEN** bookmarks exist for `/repo/src/index.ts` and `/repo/docs/guide.md`
- **WHEN** “View as Tree” is selected
- **THEN** the view SHALL surface `/repo/` as the top-level folder node
- **AND** it SHALL show `src/index.ts` and `docs/guide.md` under the appropriate folder branches

#### Scenario: Trim unrelated root folders
- **GIVEN** bookmarks exist for `/home/atman/repos/site.ts` and `/home/atman/README.md`
- **WHEN** “View as Tree” is selected
- **THEN** the view SHALL surface `/home/atman/` as the top-level folder node
- **AND** it SHALL omit ancestor folders above `/home/atman/`

#### Scenario: Expand and collapse folders
- **GIVEN** “View as Tree” is active and a folder node is collapsed
- **WHEN** the user activates the folder node
- **THEN** the node SHALL expand to show its child folders and bookmarks
- **AND** activating the node again SHALL collapse its children without removing them from the backing store

#### Scenario: Compact linear folders
- **GIVEN** tree mode is active and the bookmark store only contains `/repo/webview-ui/src/app.css`
- **WHEN** the tree renders the branch leading to `app.css`
- **THEN** it SHALL show a single folder node labeled `webview-ui/src/`
- **AND** expanding that node SHALL reveal `app.css` as its child leaf entry

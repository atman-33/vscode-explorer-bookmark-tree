# 📦 Changelog

---

## v1.1.0 2025-11-02

### Added

- replace window notifications with NotificationUtils in copy bookmark paths command
- implement "Copy Paths" command for bookmarks with clipboard functionality

### Changed

- feature/copy-bookmark-paths
- replace window notifications with NotificationUtils in copy bookmark paths tests
- add "Copy Paths" button to BOOKMARKS view for copying absolute paths
- Merge pull request #2 from atman-33/version-bump/v1.0.0

## v1.0.0 2025-11-01

### Added

- Implement drag-and-drop reordering for bookmarks with persistence and update related tests
- Update bookmark tree logic to exclude parent folder from display when already represented
- Add command to open bookmark storage file from the BOOKMARKS view
- Add "Clear All" button and command for bookmarks, including tests and data provider updates
- Enhance bookmark tree mode to start at the shared ancestor folder and trim unrelated root folders
- Add view mode toggle for bookmarks with list and tree options
- Implement delete bookmark functionality and associated tests
- Remove viewsContainers and update views structure in package.json
- Implement Explorer Bookmark Tree with bookmarking functionality and context menu integration

### Changed

- feature/core
- Update icon.png to improve visual representation
- Update README and package.json for Explorer Bookmark Tree; add new screenshot and remove obsolete image
- Add drag-and-drop reordering for bookmarks in list view with persistence
- Add command to open bookmark storage file from the BOOKMARKS view"
- Add "Clear All" control for bookmarks to enable single-action clearing of all entries
- Add toggle functionality for Bookmark view mode with list and tree options
- Mark delete bookmark command implementation and validation tasks as complete
- Add inline delete command for bookmarks in Explorer Bookmark Tree
- Mark manual validation of bookmarking functionality as complete
- Implement Explorer Bookmarking functionality with context menu commands and persistent storage
- Add initial OpenSpec prompts and project documentation

### Fixed

- Update toolbar commands for bookmark view mode toggle logic
- Update context menu group for bookmark command to improve organization
- Update command conditions to use resourceScheme for file detection


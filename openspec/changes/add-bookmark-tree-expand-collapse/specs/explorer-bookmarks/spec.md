## ADDED Requirements

### Requirement: Toggle All Folders Expansion
When Tree view mode is active, the BOOKMARKS view SHALL provide a toolbar button that expands all folder nodes if they are all currently collapsed, or collapses all folder nodes if at least one is currently expanded.

#### Scenario: Display expand/collapse toggle button
- **GIVEN** the BOOKMARK view is in Tree mode
- **WHEN** the view toolbar renders
- **THEN** it SHALL display a single toggle button for expand/collapse all
- **AND** the button SHALL use a standard VS Code icon indicating the action (expand or collapse)

#### Scenario: Expand all folders when all are collapsed
- **GIVEN** the BOOKMARK view is in Tree mode
- **AND** all folder nodes are currently collapsed
- **WHEN** the user activates the toggle button
- **THEN** all folder nodes SHALL expand to reveal their children
- **AND** the button icon SHALL update to indicate collapse action

#### Scenario: Collapse all folders when any are expanded
- **GIVEN** the BOOKMARK view is in Tree mode
- **AND** at least one folder node is currently expanded
- **WHEN** the user activates the toggle button
- **THEN** all folder nodes SHALL collapse to hide their children
- **AND** the button icon SHALL update to indicate expand action

#### Scenario: Hide toggle button in Flat view mode
- **GIVEN** the BOOKMARK view is in Flat mode
- **WHEN** the view toolbar renders
- **THEN** the expand/collapse toggle button SHALL NOT be visible
- **AND** switching to Tree mode SHALL make the button visible again

### Requirement: Reset Collapse States on View Mode Switch
When switching between Tree and Flat view modes, the extension SHALL reset all folder collapse states to their default values.

#### Scenario: Reset to collapsed when switching to Tree mode
- **GIVEN** the BOOKMARK view is switching from Flat to Tree mode
- **WHEN** the view mode change completes
- **THEN** all folder nodes SHALL be collapsed by default
- **AND** the expand/collapse toggle button SHALL indicate expand action

#### Scenario: Preserve collapse states during session
- **GIVEN** the BOOKMARK view is in Tree mode
- **AND** the user has expanded some folders
- **WHEN** bookmarks are added, deleted, or reordered
- **THEN** the folder collapse states SHALL remain unchanged
- **AND** previously expanded folders SHALL remain expanded

#### Scenario: Session-only collapse state persistence
- **GIVEN** the user has expanded folders in Tree mode
- **WHEN** VS Code is restarted
- **THEN** all folders SHALL return to the default collapsed state
- **AND** no collapse state SHALL persist across sessions

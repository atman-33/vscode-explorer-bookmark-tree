## Implementation

### 1. Command Registration
- [x] 1.1 Register `explorer-bookmarks.toggleExpandCollapse` command in `package.json`
- [x] 1.2 Add command handler in `src/commands/`
- [x] 1.3 Implement logic to detect current collapse state of all folders
- [x] 1.4 Implement expand all folders functionality
- [x] 1.5 Implement collapse all folders functionality

### 2. Toolbar Button
- [x] 2.1 Add toolbar button contribution to BOOKMARKS view title in `package.json`
- [x] 2.2 Configure appropriate icon based on current state (collapse vs expand)
- [x] 2.3 Set button visibility to show only in Tree view mode

### 3. Tree Data Provider Updates
- [x] 3.1 Add method to track collapsible state of all folder nodes
- [x] 3.2 Add method to expand all folders
- [x] 3.3 Add method to collapse all folders
- [x] 3.4 Implement state query method to determine if any folders are expanded

### 4. View Mode Integration
- [x] 4.1 Reset collapse states when switching from Flat to Tree view
- [x] 4.2 Reset collapse states when switching from Tree to Flat view

### 5. Testing
- [x] 5.1 Unit tests for expand all functionality
- [x] 5.2 Unit tests for collapse all functionality
- [x] 5.3 Unit tests for state detection logic
- [x] 5.4 Integration test for view mode switching
- [x] 5.5 Manual testing with nested bookmark structures

## Documentation
- [x] Update README.md with new expand/collapse feature
- [x] Add screenshots showing the toolbar button

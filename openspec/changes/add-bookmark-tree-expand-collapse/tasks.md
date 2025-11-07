## Implementation

### 1. Command Registration
- [ ] 1.1 Register `explorer-bookmarks.toggleExpandCollapse` command in `package.json`
- [ ] 1.2 Add command handler in `src/commands/`
- [ ] 1.3 Implement logic to detect current collapse state of all folders
- [ ] 1.4 Implement expand all folders functionality
- [ ] 1.5 Implement collapse all folders functionality

### 2. Toolbar Button
- [ ] 2.1 Add toolbar button contribution to BOOKMARKS view title in `package.json`
- [ ] 2.2 Configure appropriate icon based on current state (collapse vs expand)
- [ ] 2.3 Set button visibility to show only in Tree view mode

### 3. Tree Data Provider Updates
- [ ] 3.1 Add method to track collapsible state of all folder nodes
- [ ] 3.2 Add method to expand all folders
- [ ] 3.3 Add method to collapse all folders
- [ ] 3.4 Implement state query method to determine if any folders are expanded

### 4. View Mode Integration
- [ ] 4.1 Reset collapse states when switching from Flat to Tree view
- [ ] 4.2 Reset collapse states when switching from Tree to Flat view

### 5. Testing
- [ ] 5.1 Unit tests for expand all functionality
- [ ] 5.2 Unit tests for collapse all functionality
- [ ] 5.3 Unit tests for state detection logic
- [ ] 5.4 Integration test for view mode switching
- [ ] 5.5 Manual testing with nested bookmark structures

## Documentation
- [ ] Update README.md with new expand/collapse feature
- [ ] Add screenshots showing the toolbar button

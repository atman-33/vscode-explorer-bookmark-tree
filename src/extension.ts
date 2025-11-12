import { commands, window } from "vscode";
import type { ExtensionContext, Uri } from "vscode";
import { createBookmarkStore } from "./bookmarks/bookmark-store";
import type { BookmarkEntry } from "./bookmarks/bookmark-store";
import { createBookmarkViewModeStore } from "./bookmarks/view-mode-store";
import { registerBookmarkExplorerItemCommand } from "./commands/bookmark-explorer-item";
import { registerClearBookmarksCommand } from "./commands/clear-bookmarks";
import { registerCopyBookmarkPathsCommand } from "./commands/copy-bookmark-paths";
import { registerDeleteBookmarkCommand } from "./commands/delete-bookmark";
import { registerBookmarkViewModeCommands } from "./commands/set-bookmark-view-mode";
import {
	registerExpandCollapseCommands,
	registerToggleExpandCollapseCommand,
} from "./commands/toggle-expand-collapse";
import {
	BOOKMARK_EXPAND_COLLAPSE_ACTION_CONTEXT_KEY,
	BOOKMARK_NAMESPACE,
	BOOKMARK_TREE_VIEW_ID,
} from "./constants";
import { BookmarkTreeDataProvider } from "./providers/bookmark-tree-data-provider";
import { BookmarkFolderTreeItem } from "./providers/bookmark-tree-data-provider";
import { BookmarkTreeDragAndDropController } from "./providers/bookmark-tree-drag-controller";

const OPEN_BOOKMARK_COMMAND_ID = `${BOOKMARK_NAMESPACE}.openBookmark`;

const openBookmark = async (resource: Uri, type: BookmarkEntry["type"]) => {
	if (type === "folder") {
		await commands.executeCommand("revealInExplorer", resource);
		return;
	}

	await commands.executeCommand("vscode.open", resource);
};

export const activate = (context: ExtensionContext) => {
	const store = createBookmarkStore(context);
	const viewModeStore = createBookmarkViewModeStore(context);
	const bookmarkCommand = registerBookmarkExplorerItemCommand(store);
	const deleteBookmarkCommand = registerDeleteBookmarkCommand(store);
	const clearBookmarksCommand = registerClearBookmarksCommand(store);
	const copyBookmarkPathsCommand = registerCopyBookmarkPathsCommand(store);
	const treeProvider = new BookmarkTreeDataProvider(
		store,
		OPEN_BOOKMARK_COMMAND_ID,
		viewModeStore
	);
	const setExpandCollapseContext = async () => {
		const state = treeProvider.getFolderExpansionState();
		const mode = treeProvider.getMode();
		let action: "collapse" | "expand" | undefined;
		if (mode === "tree" && state.hasFolders) {
			action = state.anyExpanded ? "collapse" : "expand";
		} else {
			action = undefined;
		}

		try {
			await commands.executeCommand(
				"setContext",
				BOOKMARK_EXPAND_COLLAPSE_ACTION_CONTEXT_KEY,
				action
			);
		} catch {
			// Ignore context update failures; this is best-effort.
		}
	};

	const scheduleContextUpdate = () => {
		setExpandCollapseContext().catch(() => {
			/* noop */
		});
	};
	const dragAndDropController = new BookmarkTreeDragAndDropController(
		store,
		treeProvider.getMode
	);
	const openCommand = commands.registerCommand(
		OPEN_BOOKMARK_COMMAND_ID,
		(resource: Uri, type: BookmarkEntry["type"]) => openBookmark(resource, type)
	);
	const viewModeCommands = registerBookmarkViewModeCommands(viewModeStore);
	const treeView = window.createTreeView(BOOKMARK_TREE_VIEW_ID, {
		treeDataProvider: treeProvider,
		dragAndDropController,
	});
	const toggleExpandCollapseCommand = registerToggleExpandCollapseCommand(
		treeProvider,
		treeView
	);
	const expandCollapseCommands = registerExpandCollapseCommands(
		treeProvider,
		treeView
	);
	const expandListener = treeView.onDidExpandElement(({ element }) => {
		if (
			element instanceof BookmarkFolderTreeItem &&
			treeProvider.markFolderExpanded(element)
		) {
			scheduleContextUpdate();
		}
	});
	const collapseListener = treeView.onDidCollapseElement(({ element }) => {
		if (
			element instanceof BookmarkFolderTreeItem &&
			treeProvider.markFolderCollapsed(element)
		) {
			scheduleContextUpdate();
		}
	});
	const treeDataListener = treeProvider.onDidChangeTreeData(() => {
		scheduleContextUpdate();
	});
	const viewModeListener = viewModeStore.onDidChange(() => {
		scheduleContextUpdate();
	});

	scheduleContextUpdate();

	context.subscriptions.push(store);
	context.subscriptions.push(viewModeStore);
	context.subscriptions.push(bookmarkCommand);
	context.subscriptions.push(deleteBookmarkCommand);
	context.subscriptions.push(clearBookmarksCommand);
	context.subscriptions.push(copyBookmarkPathsCommand);
	context.subscriptions.push(treeProvider);
	context.subscriptions.push(dragAndDropController);
	context.subscriptions.push(openCommand);
	context.subscriptions.push(viewModeCommands);
	context.subscriptions.push(toggleExpandCollapseCommand);
	context.subscriptions.push(expandCollapseCommands);
	context.subscriptions.push(expandListener);
	context.subscriptions.push(collapseListener);
	context.subscriptions.push(treeDataListener);
	context.subscriptions.push(viewModeListener);
	context.subscriptions.push(treeView);
};

// this method is called when your extension is deactivated
// biome-ignore lint/suspicious/noEmptyBlockStatements: ignore
export function deactivate() {}

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
import { BookmarkTreeDataProvider } from "./providers/bookmark-tree-data-provider";
import { BookmarkTreeDragAndDropController } from "./providers/bookmark-tree-drag-controller";

const TREE_VIEW_ID = "explorerBookmarkTree";
const OPEN_BOOKMARK_COMMAND_ID = "explorerBookmarkTree.openBookmark";

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
	const dragAndDropController = new BookmarkTreeDragAndDropController(
		store,
		treeProvider.getMode
	);
	const openCommand = commands.registerCommand(
		OPEN_BOOKMARK_COMMAND_ID,
		(resource: Uri, type: BookmarkEntry["type"]) => openBookmark(resource, type)
	);
	const viewModeCommands = registerBookmarkViewModeCommands(viewModeStore);
	const treeView = window.createTreeView(TREE_VIEW_ID, {
		treeDataProvider: treeProvider,
		dragAndDropController,
	});

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
	context.subscriptions.push(treeView);
};

// this method is called when your extension is deactivated
// biome-ignore lint/suspicious/noEmptyBlockStatements: ignore
export function deactivate() {}

import { commands, Disposable } from "vscode";
import {
	BOOKMARK_NAMESPACE,
	BOOKMARK_VIEW_MODE_CONTEXT_KEY,
} from "../constants";
import type {
	BookmarkViewMode,
	BookmarkViewModeStore,
} from "../bookmarks/view-mode-store";

export const VIEW_MODE_LIST_COMMAND_ID = `${BOOKMARK_NAMESPACE}.viewMode.list`;
export const VIEW_MODE_TREE_COMMAND_ID = `${BOOKMARK_NAMESPACE}.viewMode.tree`;

const applyContext = async (mode: BookmarkViewMode) => {
	try {
		await commands.executeCommand(
			"setContext",
			BOOKMARK_VIEW_MODE_CONTEXT_KEY,
			mode
		);
	} catch {
		// Ignore failures; context updates are best effort.
	}
};

export const registerBookmarkViewModeCommands = (
	store: BookmarkViewModeStore
): Disposable => {
	const setMode = (mode: BookmarkViewMode) => store.setMode(mode);

	const listCommand = commands.registerCommand(VIEW_MODE_LIST_COMMAND_ID, () =>
		setMode("list")
	);

	const treeCommand = commands.registerCommand(VIEW_MODE_TREE_COMMAND_ID, () =>
		setMode("tree")
	);

	applyContext(store.getMode());
	const subscription = store.onDidChange((mode) => {
		applyContext(mode);
	});

	return Disposable.from(listCommand, treeCommand, subscription);
};

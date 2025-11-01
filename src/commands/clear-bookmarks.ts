import { commands, type Disposable, window } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import { BOOKMARK_NAMESPACE } from "../constants";

export const CLEAR_BOOKMARKS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.clearBookmarks`;

const handleError = async (error: unknown) => {
	if (!(error instanceof Error)) {
		return;
	}

	try {
		await window.showWarningMessage(error.message);
	} catch {
		// Swallow notification failures; warning is best-effort.
	}
};

export const registerClearBookmarksCommand = (
	store: BookmarkStore
): Disposable =>
	commands.registerCommand(CLEAR_BOOKMARKS_COMMAND_ID, async () => {
		try {
			await store.clear();
		} catch (error) {
			await handleError(error);
		}
	});

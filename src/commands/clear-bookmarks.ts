import { commands, type Disposable, window } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import { BOOKMARK_NAMESPACE } from "../constants";

export const CLEAR_BOOKMARKS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.clearBookmarks`;

const CLEAR_ALL_CONFIRMATION_MESSAGE =
	"Are you sure you want to clear all bookmarks? This action cannot be undone.";
const CLEAR_ALL_CONFIRM_BUTTON = "Yes";

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
			const choice = await window.showWarningMessage(
				CLEAR_ALL_CONFIRMATION_MESSAGE,
				{ modal: true },
				CLEAR_ALL_CONFIRM_BUTTON
			);

			if (choice !== CLEAR_ALL_CONFIRM_BUTTON) {
				// User cancelled or dismissed the dialog
				return;
			}

			await store.clear();
		} catch (error) {
			await handleError(error);
		}
	});

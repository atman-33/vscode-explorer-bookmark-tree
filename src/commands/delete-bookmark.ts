import { commands, window } from "vscode";
import type { Disposable } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import type { BookmarkTreeItem } from "../providers/bookmark-tree-data-provider";

export const DELETE_BOOKMARK_COMMAND_ID = "explorerBookmarkTree.deleteBookmark";

const collectTargets = (
	item: BookmarkTreeItem | undefined,
	selection?: BookmarkTreeItem[]
) => {
	if (selection && selection.length > 0) {
		return selection;
	}

	return item ? [item] : [];
};

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

export const registerDeleteBookmarkCommand = (
	store: BookmarkStore
): Disposable =>
	commands.registerCommand(
		DELETE_BOOKMARK_COMMAND_ID,
		async (
			item: BookmarkTreeItem | undefined,
			selection?: BookmarkTreeItem[]
		) => {
			const targets = collectTargets(item, selection);
			if (targets.length === 0) {
				return;
			}

			for (const target of targets) {
				try {
					await store.remove(target.bookmark.uri);
				} catch (error) {
					await handleError(error);
				}
			}
		}
	);

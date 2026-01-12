import { commands, type Disposable } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import { BOOKMARK_NAMESPACE } from "../constants";

export const REFRESH_BOOKMARKS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.refreshBookmarks`;

export const registerRefreshBookmarksCommand = (
	store: BookmarkStore
): Disposable =>
	commands.registerCommand(REFRESH_BOOKMARKS_COMMAND_ID, () => {
		store.refresh();
	});

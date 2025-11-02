import { commands, Disposable, env, Uri, window } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";
import {
	BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY,
	BOOKMARK_NAMESPACE,
} from "../constants";

export const COPY_BOOKMARK_PATHS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.copyPaths`;
const STATUS_MESSAGE_DURATION_MS = 2000;

const applyHasBookmarksContext = async (hasBookmarks: boolean) => {
	try {
		await commands.executeCommand(
			"setContext",
			BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY,
			hasBookmarks
		);
	} catch {
		// Ignore failures; context updates are best effort.
	}
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

const toAbsolutePaths = (entries: BookmarkEntry[]) =>
	entries.map((entry) => Uri.parse(entry.uri).fsPath);

const notifyCopySuccess = (count: number) => {
	const detail = count === 1 ? "bookmark path" : "bookmark paths";
	window.setStatusBarMessage(
		`Copied ${count} ${detail}`,
		STATUS_MESSAGE_DURATION_MS
	);
};

export const registerCopyBookmarkPathsCommand = (
	store: BookmarkStore
): Disposable => {
	const syncContext = (items: BookmarkEntry[]) => {
		applyHasBookmarksContext(items.length > 0);
	};

	syncContext(store.getAll());
	const subscription = store.onDidChange((items) => {
		syncContext(items);
	});

	const command = commands.registerCommand(
		COPY_BOOKMARK_PATHS_COMMAND_ID,
		async () => {
			const entries = store.getAll();
			if (entries.length === 0) {
				return;
			}

			try {
				const paths = toAbsolutePaths(entries);
				if (paths.length === 0) {
					return;
				}

				await env.clipboard.writeText(paths.join("\n"));
				notifyCopySuccess(paths.length);
			} catch (error) {
				await handleError(error);
			}
		}
	);

	return Disposable.from(command, subscription);
};

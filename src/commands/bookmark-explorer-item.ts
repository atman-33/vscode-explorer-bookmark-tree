import path from "node:path";
import { FileType, commands, window, workspace } from "vscode";
import type { Disposable, Uri } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";

export const BOOKMARK_COMMAND_ID = "explorerBookmarkTree.bookmarkExplorerItem";

const deriveLabel = (uri: Uri) => {
	const fileSystemPath = uri.fsPath;
	const label = path.basename(fileSystemPath);
	return (
		label || uri.path.split("/").filter(Boolean).pop() || uri.toString(true)
	);
};

const detectType = (fileType: FileType): BookmarkEntry["type"] =>
	fileType === FileType.Directory ? "folder" : "file";

const toEntry = (target: Uri, type: BookmarkEntry["type"]): BookmarkEntry => ({
	label: deriveLabel(target),
	type,
	uri: target.toString(),
});

const collectTargets = (resource: Uri | undefined, selection?: Uri[]) => {
	if (selection && selection.length > 0) {
		return selection;
	}

	return resource ? [resource] : [];
};

const handleError = async (error: unknown) => {
	if (!(error instanceof Error)) {
		return;
	}

	try {
		await window.showWarningMessage(error.message);
	} catch {
		// Swallow warning failures; notification is best-effort.
	}
};

export const registerBookmarkExplorerItemCommand = (
	store: BookmarkStore
): Disposable =>
	commands.registerCommand(
		BOOKMARK_COMMAND_ID,
		async (resource: Uri | undefined, selection?: Uri[]) => {
			const targets = collectTargets(resource, selection);
			if (targets.length === 0) {
				return;
			}

			for (const target of targets) {
				try {
					const stats = await workspace.fs.stat(target);
					const type = detectType(stats.type);
					const entry = toEntry(target, type);
					await store.add(entry);
				} catch (error) {
					await handleError(error);
				}
			}
		}
	);

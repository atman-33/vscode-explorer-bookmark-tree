import { commands, Uri, window, workspace } from "vscode";
import type { Disposable, ExtensionContext } from "vscode";
import { BOOKMARK_NAMESPACE } from "../constants";

export const OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID = `${BOOKMARK_NAMESPACE}.openBookmarkStorageFile`;

const STORAGE_FILE_CANDIDATES = ["globalState.json", "state.vscdb"];

const findExistingStorageFile = async (root: Uri): Promise<Uri | undefined> => {
	for (const candidate of STORAGE_FILE_CANDIDATES) {
		const target = Uri.joinPath(root, candidate);

		try {
			await workspace.fs.stat(target);
			return target;
		} catch {
			// Ignore missing candidates; try the next filename.
		}
	}

	return;
};

const openStorageFile = async (uri: Uri) => {
	const document = await workspace.openTextDocument(uri);
	await window.showTextDocument(document, { preview: true });
};

const showInformationMessage = async (message: string) => {
	try {
		await window.showInformationMessage(message);
	} catch {
		// Swallow notification failures; message is best-effort.
	}
};

export const registerOpenBookmarkStorageFileCommand = (
	context: ExtensionContext
): Disposable =>
	commands.registerCommand(OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID, async () => {
		let storageFile: Uri | undefined;

		try {
			storageFile = await findExistingStorageFile(context.globalStorageUri);
		} catch {
			await showInformationMessage(
				"Bookmark storage file could not be located."
			);
			return;
		}

		if (!storageFile) {
			await showInformationMessage("Bookmark storage file was not found.");
			return;
		}

		try {
			await openStorageFile(storageFile);
		} catch {
			await showInformationMessage(
				"Bookmark storage file could not be opened."
			);
		}
	});

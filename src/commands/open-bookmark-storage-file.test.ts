/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
/** biome-ignore-all lint/performance/useTopLevelRegex: ignore */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	commands,
	type ExtensionContext,
	type FileStat,
	type TextDocument,
	type TextEditor,
	Uri,
	window,
	workspace,
} from "vscode";
import {
	OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID,
	registerOpenBookmarkStorageFileCommand,
} from "./open-bookmark-storage-file";

const ensureUriJoinPath = () => {
	if (
		typeof (Uri as unknown as { joinPath?: unknown }).joinPath === "function"
	) {
		return;
	}

	Object.defineProperty(Uri, "joinPath", {
		value: (base: Uri, ...segments: string[]) => {
			const baseString = base.toString().replace(/\/+$/, "");
			const suffix = segments
				.map((segment) => segment.replace(/^\/+/, ""))
				.join("/");
			return Uri.parse(`${baseString}/${suffix}`);
		},
	});
};

ensureUriJoinPath();

describe("registerOpenBookmarkStorageFileCommand", () => {
	beforeEach(() => {
		(
			workspace as {
				openTextDocument?: typeof workspace.openTextDocument;
			}
		).openTextDocument ??= vi.fn();
		(
			window as {
				showTextDocument?: typeof window.showTextDocument;
			}
		).showTextDocument ??= vi.fn();
		(
			window as {
				showInformationMessage?: typeof window.showInformationMessage;
			}
		).showInformationMessage ??= vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const createContext = (): ExtensionContext =>
		({
			globalStorageUri: Uri.parse("file:///workspace/storage"),
		}) as unknown as ExtensionContext;

	it("opens the storage file when it exists", async () => {
		const context = createContext();

		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			});

		const statSpy = vi.spyOn(workspace.fs, "stat").mockResolvedValue({
			type: 1,
			ctime: 0,
			mtime: 0,
			size: 0,
		} as FileStat);

		const targetUri = Uri.joinPath(
			context.globalStorageUri,
			"globalState.json"
		);
		const document = { uri: targetUri } as TextDocument;
		const openDocumentSpy = vi
			.spyOn(workspace, "openTextDocument")
			.mockResolvedValue(document);
		const showDocumentSpy = vi
			.spyOn(window, "showTextDocument")
			.mockResolvedValue({} as TextEditor);
		const infoMessageSpy = vi
			.spyOn(window, "showInformationMessage")
			.mockResolvedValue(undefined);

		const disposable = registerOpenBookmarkStorageFileCommand(context);
		expect(registerSpy).toHaveBeenCalled();

		await registeredHandler?.();

		expect(statSpy).toHaveBeenCalledTimes(1);
		expect(openDocumentSpy).toHaveBeenCalledWith(targetUri);
		expect(showDocumentSpy).toHaveBeenCalledWith(document, { preview: true });
		expect(infoMessageSpy).not.toHaveBeenCalled();

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
	});

	it("shows an information message when no storage file is found", async () => {
		const context = createContext();

		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		vi.spyOn(commands, "registerCommand").mockImplementation(
			(identifier, callback) => {
				expect(identifier).toBe(OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			}
		);

		const error = Object.assign(new Error("missing"), { code: "FileNotFound" });
		const statSpy = vi.spyOn(workspace.fs, "stat").mockRejectedValue(error);
		const openDocumentSpy = vi.spyOn(workspace, "openTextDocument");
		const infoMessageSpy = vi
			.spyOn(window, "showInformationMessage")
			.mockResolvedValue(undefined);

		registerOpenBookmarkStorageFileCommand(context);

		await registeredHandler?.();

		expect(statSpy).toHaveBeenCalledTimes(2);
		expect(openDocumentSpy).not.toHaveBeenCalled();
		expect(infoMessageSpy).toHaveBeenCalledWith(
			"Bookmark storage file was not found."
		);
	});

	it("shows an information message when the storage file cannot be opened", async () => {
		const context = createContext();

		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		vi.spyOn(commands, "registerCommand").mockImplementation(
			(identifier, callback) => {
				expect(identifier).toBe(OPEN_BOOKMARK_STORAGE_FILE_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			}
		);

		const targetUri = Uri.joinPath(
			context.globalStorageUri,
			"globalState.json"
		);
		vi.spyOn(workspace.fs, "stat").mockResolvedValue({
			type: 1,
			ctime: 0,
			mtime: 0,
			size: 0,
		} as FileStat);
		vi.spyOn(workspace, "openTextDocument").mockRejectedValue(
			new Error("failed to open")
		);
		const infoMessageSpy = vi
			.spyOn(window, "showInformationMessage")
			.mockResolvedValue(undefined);
		const showDocumentSpy = vi.spyOn(window, "showTextDocument");

		registerOpenBookmarkStorageFileCommand(context);

		await registeredHandler?.();

		expect(showDocumentSpy).not.toHaveBeenCalled();
		expect(infoMessageSpy).toHaveBeenCalledWith(
			"Bookmark storage file could not be opened."
		);

		expect(workspace.openTextDocument).toHaveBeenCalledWith(targetUri);
	});
});

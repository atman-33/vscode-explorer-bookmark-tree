import { beforeEach, describe, expect, it, vi } from "vitest";
import { commands, env, window } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";
import { BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY } from "../constants";
import {
	COPY_BOOKMARK_PATHS_COMMAND_ID,
	registerCopyBookmarkPathsCommand,
} from "./copy-bookmark-paths";

const createStore = (initial: BookmarkEntry[] = []) => {
	let entries = [...initial];
	let listener: ((items: BookmarkEntry[]) => void) | undefined;

	const store: BookmarkStore = {
		getAll: () => [...entries],
		add: async () => {
			/* no-op for tests */
		},
		reorder: async () => {
			/* no-op for tests */
		},
		remove: async () => {
			/* no-op for tests */
		},
		clear: async () => {
			/* no-op for tests */
		},
		onDidChange: (callback) => {
			listener = callback;
			return {
				dispose: () => {
					listener = undefined;
				},
			};
		},
		dispose: () => {
			listener = undefined;
		},
	};

	return {
		store,
		setEntries: (next: BookmarkEntry[]) => {
			entries = [...next];
			listener?.([...entries]);
		},
	};
};

describe("registerCopyBookmarkPathsCommand", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("copies newline-delimited absolute paths to the clipboard", async () => {
		const entries: BookmarkEntry[] = [
			{
				label: "src/index.ts",
				type: "file",
				uri: "file:///workspace/src/index.ts",
			},
			{
				label: "docs",
				type: "folder",
				uri: "file:///workspace/docs",
			},
		];

		const { store } = createStore(entries);
		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(COPY_BOOKMARK_PATHS_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			});

		const contextSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);
		const clipboardSpy = vi
			.spyOn(env.clipboard, "writeText")
			.mockResolvedValue(undefined);
		const statusSpy = vi
			.spyOn(window, "setStatusBarMessage")
			.mockReturnValue({ dispose: vi.fn() });

		const disposable = registerCopyBookmarkPathsCommand(store);
		await Promise.resolve();

		expect(contextSpy).toHaveBeenCalledWith(
			"setContext",
			BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY,
			true
		);

		await registeredHandler?.();

		expect(clipboardSpy).toHaveBeenCalledWith(
			"/workspace/src/index.ts\n/workspace/docs"
		);
		expect(statusSpy).toHaveBeenCalledWith(
			expect.stringContaining("Copied 2"),
			expect.any(Number)
		);

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
	});

	it("skips copy when no bookmarks exist", async () => {
		const { store, setEntries } = createStore([]);
		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		vi.spyOn(commands, "registerCommand").mockImplementation(
			(identifier, callback) => {
				expect(identifier).toBe(COPY_BOOKMARK_PATHS_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			}
		);

		const contextSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);
		const clipboardSpy = vi
			.spyOn(env.clipboard, "writeText")
			.mockResolvedValue(undefined);

		registerCopyBookmarkPathsCommand(store);
		await Promise.resolve();

		expect(contextSpy).toHaveBeenCalledWith(
			"setContext",
			BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY,
			false
		);

		await registeredHandler?.();
		expect(clipboardSpy).not.toHaveBeenCalled();

		setEntries([
			{
				label: "README.md",
				type: "file",
				uri: "file:///repo/README.md",
			},
		]);
		await Promise.resolve();

		expect(contextSpy).toHaveBeenCalledWith(
			"setContext",
			BOOKMARK_HAS_BOOKMARKS_CONTEXT_KEY,
			true
		);
	});

	it("surfaces clipboard errors via warning notification", async () => {
		const entries: BookmarkEntry[] = [
			{
				label: "src/index.ts",
				type: "file",
				uri: "file:///workspace/src/index.ts",
			},
		];

		const { store } = createStore(entries);
		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };

		vi.spyOn(commands, "registerCommand").mockImplementation(
			(identifier, callback) => {
				expect(identifier).toBe(COPY_BOOKMARK_PATHS_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			}
		);

		vi.spyOn(commands, "executeCommand").mockResolvedValue(undefined);
		vi.spyOn(env.clipboard, "writeText").mockRejectedValue(
			new Error("clipboard unavailable")
		);
		const warningSpy = vi
			.spyOn(window, "showWarningMessage")
			.mockResolvedValue(undefined);

		registerCopyBookmarkPathsCommand(store);
		await Promise.resolve();
		await registeredHandler?.();

		expect(warningSpy).toHaveBeenCalledWith("clipboard unavailable");
	});
});

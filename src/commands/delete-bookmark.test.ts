/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
import { describe, expect, it, vi } from "vitest";
import { commands } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";
import type { BookmarkTreeItem } from "../providers/bookmark-tree-data-provider";
import {
	DELETE_BOOKMARK_COMMAND_ID,
	registerDeleteBookmarkCommand,
} from "./delete-bookmark";

describe("registerDeleteBookmarkCommand", () => {
	it("removes selected bookmarks via the store", async () => {
		const removeMock = vi.fn<(targetUri: string) => Promise<void>>(
			async (_targetUri) => undefined
		);
		const store: BookmarkStore = {
			add: async () => undefined,
			remove: (targetUri: string) => removeMock(targetUri),
			getAll: () => [],
			onDidChange: () => ({ dispose: () => undefined }),
			dispose: () => undefined,
		};

		let registeredHandler:
			| ((
					item: BookmarkTreeItem | undefined,
					selection?: BookmarkTreeItem[]
			  ) => Promise<void>)
			| undefined;
		const registration = { dispose: vi.fn() };
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(DELETE_BOOKMARK_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			});

		const disposable = registerDeleteBookmarkCommand(store);
		expect(registerSpy).toHaveBeenCalled();

		const entry: BookmarkEntry = {
			label: "notes.md",
			type: "file",
			uri: "file:///workspace/notes.md",
		};

		const targetItem = { bookmark: entry } as BookmarkTreeItem;
		await registeredHandler?.(targetItem);

		expect(removeMock).toHaveBeenCalledWith(entry.uri);

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
	});
});

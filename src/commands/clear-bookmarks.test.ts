/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
import { describe, expect, it, vi } from "vitest";
import { commands } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import {
	CLEAR_BOOKMARKS_COMMAND_ID,
	registerClearBookmarksCommand,
} from "./clear-bookmarks";

describe("registerClearBookmarksCommand", () => {
	it("clears all bookmarks via the store", async () => {
		const clearMock = vi.fn<() => Promise<void>>(async () => undefined);
		const store: BookmarkStore = {
			add: async () => undefined,
			reorder: async () => undefined,
			remove: async () => undefined,
			clear: () => clearMock(),
			getAll: () => [],
			onDidChange: () => ({ dispose: () => undefined }),
			dispose: () => undefined,
		};

		let registeredHandler: (() => Promise<void>) | undefined;
		const registration = { dispose: vi.fn() };
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(CLEAR_BOOKMARKS_COMMAND_ID);
				registeredHandler = callback;
				return registration;
			});

		const disposable = registerClearBookmarksCommand(store);
		expect(registerSpy).toHaveBeenCalled();

		await registeredHandler?.();

		expect(clearMock).toHaveBeenCalledTimes(1);

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
	});
});

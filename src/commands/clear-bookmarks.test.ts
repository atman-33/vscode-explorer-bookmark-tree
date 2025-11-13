/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
import { describe, expect, it, vi } from "vitest";
import { commands, window } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import {
	CLEAR_BOOKMARKS_COMMAND_ID,
	registerClearBookmarksCommand,
} from "./clear-bookmarks";

describe("registerClearBookmarksCommand", () => {
	it("clears all bookmarks when user confirms", async () => {
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

		// Mock the confirmation dialog to simulate user clicking "Yes"
		const showWarningMessageSpy = vi
			.spyOn(window, "showWarningMessage")
			.mockResolvedValue("Yes");

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

		expect(showWarningMessageSpy).toHaveBeenCalledTimes(1);
		expect(showWarningMessageSpy).toHaveBeenCalledWith(
			expect.stringContaining("clear all bookmarks"),
			{ modal: true },
			"Yes"
		);
		expect(clearMock).toHaveBeenCalledTimes(1);

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
		showWarningMessageSpy.mockRestore();
	});

	it("does not clear bookmarks when user cancels", async () => {
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

		// Mock the confirmation dialog to simulate user clicking "Cancel" (undefined)
		const showWarningMessageSpy = vi
			.spyOn(window, "showWarningMessage")
			.mockResolvedValue(undefined);

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

		expect(showWarningMessageSpy).toHaveBeenCalledTimes(1);
		expect(clearMock).not.toHaveBeenCalled();

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
		showWarningMessageSpy.mockRestore();
	});
});

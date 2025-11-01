import { describe, expect, it, vi } from "vitest";
import type { ExtensionContext, Memento } from "vscode";
import { createBookmarkViewModeStore } from "./view-mode-store";

const createContext = (initial?: unknown) => {
	let value = initial;
	const update = vi.fn((_key: string, next: unknown) => {
		value = next;
		return Promise.resolve();
	});

	const globalState: Memento = {
		get: <T>(_: string, defaultValue?: T) => (value ?? defaultValue) as T,
		update,
		keys: () => [],
	};

	const context = {
		globalState,
		subscriptions: [],
	} as unknown as ExtensionContext;

	return {
		context,
		update,
		getStored: () => value,
	};
};

describe("createBookmarkViewModeStore", () => {
	it("defaults to list when storage is empty", () => {
		const { context } = createContext();
		const store = createBookmarkViewModeStore(context);

		expect(store.getMode()).toBe("list");
		store.dispose();
	});

	it("restores the stored view mode", () => {
		const { context } = createContext("tree");
		const store = createBookmarkViewModeStore(context);

		expect(store.getMode()).toBe("tree");
		store.dispose();
	});

	it("persists and emits when the mode changes", async () => {
		const { context, update } = createContext();
		const store = createBookmarkViewModeStore(context);
		const listener = vi.fn();

		store.onDidChange(listener);
		await store.setMode("tree");

		expect(update).toHaveBeenCalledWith(expect.anything(), "tree");
		expect(listener).toHaveBeenCalledWith("tree");
		expect(store.getMode()).toBe("tree");
		store.dispose();
	});
});

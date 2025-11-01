import { describe, expect, it, vi } from "vitest";
import { createBookmarkStore } from "./bookmark-store";
import type { ExtensionContext } from "vscode";
import { Uri } from "vscode";

const createMockContext = (initialValue?: unknown) => {
	let state = initialValue;

	const context = {
		globalState: {
			get: () => state,
			update: (_key: string, value: unknown) => {
				state = value;
				return Promise.resolve();
			},
		},
		subscriptions: [],
	} as unknown as ExtensionContext;

	return { context, readState: () => state };
};

describe("createBookmarkStore", () => {
	it("persists and emits new bookmarks", async () => {
		const { context, readState } = createMockContext([]);
		const store = createBookmarkStore(context);
		const listener = vi.fn();
		store.onDidChange(listener);

		const entry = {
			label: "notes.md",
			type: "file" as const,
			uri: "file:///workspace/notes.md",
		};

		expect(store.getAll()).toEqual([]);
		await store.add(entry);

		expect(store.getAll()).toEqual([entry]);
		expect(readState()).toEqual([entry]);
		expect(listener).toHaveBeenCalledWith([entry]);

		await store.add(entry);
		expect(store.getAll()).toEqual([entry]);
	});

	it("removes bookmarks and emits updates", async () => {
		const entry = {
			label: "notes.md",
			type: "file" as const,
			uri: "file:///workspace/notes.md",
		};
		const { context, readState } = createMockContext([entry]);
		const store = createBookmarkStore(context);
		const listener = vi.fn();
		store.onDidChange(listener);

		expect(store.getAll()).toEqual([entry]);
		await store.remove(entry.uri);

		expect(store.getAll()).toEqual([]);
		expect(readState()).toEqual([]);
		expect(listener).toHaveBeenCalledWith([]);

		await store.remove(entry.uri);
		expect(store.getAll()).toEqual([]);
	});

	it("clears all bookmarks and emits a single empty update", async () => {
		const first = {
			label: "notes.md",
			type: "file" as const,
			uri: "file:///workspace/notes.md",
		};
		const second = {
			label: "docs",
			type: "folder" as const,
			uri: "file:///workspace/docs",
		};
		const { context, readState } = createMockContext([first, second]);
		const store = createBookmarkStore(context);
		const listener = vi.fn();
		store.onDidChange(listener);

		await store.clear();

		expect(store.getAll()).toEqual([]);
		expect(readState()).toEqual([]);
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith([]);

		await store.clear();
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("filters out invalid stored entries", () => {
		const invalidUri = "file:///invalid";
		const storedValue = [
			{
				label: "missing-uri",
				type: "file" as const,
				uri: "",
			},
			{
				label: "bad-uri",
				type: "folder" as const,
				uri: invalidUri,
			},
			{
				label: "good",
				type: "file" as const,
				uri: "file:///workspace/good.txt",
			},
		];

		const originalParse = Uri.parse;
		const parseSpy = vi
			.spyOn(Uri, "parse")
			.mockImplementation((value: string) => {
				if (value === invalidUri) {
					throw new Error("Invalid URI");
				}

				return originalParse(value);
			});

		const { context } = createMockContext(storedValue);
		const store = createBookmarkStore(context);

		expect(store.getAll()).toEqual([
			{
				label: "good",
				type: "file",
				uri: "file:///workspace/good.txt",
			},
		]);

		parseSpy.mockRestore();
	});

	it("reorders bookmarks, persists updates, and emits change events", async () => {
		const first = {
			label: "first.txt",
			type: "file" as const,
			uri: "file:///workspace/first.txt",
		};
		const second = {
			label: "second.txt",
			type: "file" as const,
			uri: "file:///workspace/second.txt",
		};
		const third = {
			label: "third.txt",
			type: "file" as const,
			uri: "file:///workspace/third.txt",
		};

		const { context, readState } = createMockContext([first, second, third]);
		const store = createBookmarkStore(context);
		const listener = vi.fn();
		store.onDidChange(listener);

		await store.reorder([third.uri], first.uri);

		expect(store.getAll()).toEqual([third, first, second]);
		expect(readState()).toEqual([third, first, second]);
		expect(listener).toHaveBeenCalledWith([third, first, second]);

		await store.reorder([first.uri], undefined);
		expect(store.getAll()).toEqual([third, second, first]);
		expect(readState()).toEqual([third, second, first]);

		// Ignore requests that attempt to drop onto a dragged item.
		await store.reorder([third.uri], third.uri);
		expect(store.getAll()).toEqual([third, second, first]);
	});
});

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
});

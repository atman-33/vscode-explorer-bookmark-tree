import { describe, expect, it, vi } from "vitest";
import { BookmarkTreeDataProvider } from "./bookmark-tree-data-provider";
import type { BookmarkTreeItem } from "./bookmark-tree-data-provider";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";

const createStore = (initial: BookmarkEntry[] = []) => {
	let entries = [...initial];
	let listeners: Array<(items: BookmarkEntry[]) => void> = [];

	const store: BookmarkStore = {
		getAll: () => [...entries],
		add: (entry) => {
			entries = [...entries, entry];
			for (const listener of listeners) {
				listener([...entries]);
			}

			return Promise.resolve();
		},
		remove: (uri) => {
			entries = entries.filter((entry) => entry.uri !== uri);
			for (const listener of listeners) {
				listener([...entries]);
			}

			return Promise.resolve();
		},
		onDidChange: (listener) => {
			listeners = [...listeners, listener];
			return {
				dispose: () => {
					listeners = listeners.filter((item) => item !== listener);
				},
			};
		},
		dispose: () => {
			listeners = [];
		},
	};

	return {
		store,
		setEntries: (next: BookmarkEntry[]) => {
			entries = [...next];
			for (const listener of listeners) {
				listener([...entries]);
			}
		},
	};
};

describe("BookmarkTreeDataProvider", () => {
	it("creates tree items with configured command", () => {
		const entry: BookmarkEntry = {
			label: "notes.md",
			type: "file",
			uri: "file:///workspace/notes.md",
		};

		const { store } = createStore([entry]);
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark"
		);

		const children = provider.getChildren();
		expect(children).toHaveLength(1);
		const item = children[0] as BookmarkTreeItem;

		expect(item.label).toBe(entry.label);
		expect(item.contextValue).toBe("bookmark:file");
		expect(item.command).toEqual({
			arguments: [expect.anything(), entry.type],
			command: "explorerBookmarkTree.openBookmark",
			title: "Open Bookmark",
		});
		expect(item.resource.toString()).toBe(entry.uri);
	});

	it("emits refresh notifications when the store updates", async () => {
		const entry: BookmarkEntry = {
			label: "docs",
			type: "folder",
			uri: "file:///workspace/docs",
		};

		const { store } = createStore();
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark"
		);
		const listener = vi.fn();

		provider.onDidChangeTreeData(listener);
		await store.add(entry);

		expect(listener).toHaveBeenCalledWith(undefined);

		provider.dispose();
	});
});

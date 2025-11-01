import { describe, expect, it, vi } from "vitest";
import {
	BookmarkFolderTreeItem,
	BookmarkTreeDataProvider,
	BookmarkTreeItem,
} from "./bookmark-tree-data-provider";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";
import type { BookmarkViewModeStore } from "../bookmarks/view-mode-store";

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
		clear: () => {
			entries = [];
			for (const listener of listeners) {
				listener([]);
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

const createViewModeStore = (initial: "list" | "tree" = "list") => {
	let mode: "list" | "tree" = initial;
	let listeners: Array<(value: "list" | "tree") => void> = [];

	const store: BookmarkViewModeStore = {
		getMode: () => mode,
		setMode: (next) => {
			if (next === mode) {
				return Promise.resolve();
			}

			mode = next;
			for (const listener of listeners) {
				listener(mode);
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
		setMode: (next: "list" | "tree") => {
			mode = next;
			for (const listener of listeners) {
				listener(mode);
			}
		},
	};
};

describe("BookmarkTreeDataProvider", () => {
	it("creates tree items with configured command in list mode", () => {
		const entry: BookmarkEntry = {
			label: "notes.md",
			type: "file",
			uri: "file:///workspace/notes.md",
		};

		const { store } = createStore([entry]);
		const { store: viewModeStore } = createViewModeStore("list");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
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
		const { store: viewModeStore } = createViewModeStore("list");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);
		const listener = vi.fn();

		provider.onDidChangeTreeData(listener);
		await store.add(entry);

		expect(listener).toHaveBeenCalledWith(undefined);

		provider.dispose();
	});

	it("renders an empty list after the store clears all bookmarks", async () => {
		const entries: BookmarkEntry[] = [
			{
				label: "notes.md",
				type: "file",
				uri: "file:///workspace/notes.md",
			},
			{
				label: "docs",
				type: "folder",
				uri: "file:///workspace/docs",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("list");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);
		const listener = vi.fn();
		provider.onDidChangeTreeData(listener);

		expect(provider.getChildren()).toHaveLength(entries.length);

		await store.clear();

		expect(listener).toHaveBeenCalledWith(undefined);
		expect(provider.getChildren()).toEqual([]);

		provider.dispose();
	});

	it("renders hierarchical nodes when tree mode is active", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "src/index.ts",
				type: "file",
				uri: "file:///repo/src/index.ts",
			},
			{
				label: "docs",
				type: "folder",
				uri: "file:///repo/docs",
			},
			{
				label: "docs/guide.md",
				type: "file",
				uri: "file:///repo/docs/guide.md",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("tree");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);

		const topLevel = provider.getChildren();
		expect(topLevel).toHaveLength(1);
		const repoFolder = topLevel[0];
		expect(repoFolder).toBeInstanceOf(BookmarkFolderTreeItem);
		expect(repoFolder.label).toBe("/repo");

		const repoChildren = provider.getChildren(
			repoFolder as BookmarkFolderTreeItem
		);
		const expectedTopLevelChildren = 3;
		expect(repoChildren).toHaveLength(expectedTopLevelChildren);

		const folderNodes = repoChildren.filter(
			(child) => child instanceof BookmarkFolderTreeItem
		) as BookmarkFolderTreeItem[];
		const folderNames = folderNodes.map((child) => child.label);
		expect(folderNames).toContain("docs");
		expect(folderNames).toContain("src");

		const leafLabels = repoChildren
			.filter((child) => child instanceof BookmarkTreeItem)
			.map((child) => child.label);
		expect(leafLabels).toContain("docs");

		const srcNode = folderNodes.find((child) => child.label === "src");
		const srcChildren = srcNode ? provider.getChildren(srcNode) : [];
		const srcLeafLabels = srcChildren
			.filter((child) => child instanceof BookmarkTreeItem)
			.map((child) => child.label);
		expect(srcLeafLabels).toContain("src/index.ts");
	});

	it("starts tree mode at the shared ancestor folder", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "site.ts",
				type: "file",
				uri: "file:///home/atman/repos/site.ts",
			},
			{
				label: "README.md",
				type: "file",
				uri: "file:///home/atman/README.md",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("tree");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);

		const topLevel = provider.getChildren();
		expect(topLevel).toHaveLength(1);
		const ancestor = topLevel[0] as BookmarkFolderTreeItem;
		expect(ancestor.segments).toEqual(["home", "atman"]);

		const ancestorChildren = provider.getChildren(ancestor);
		const folderNodes = ancestorChildren.filter(
			(child) => child instanceof BookmarkFolderTreeItem
		) as BookmarkFolderTreeItem[];
		const folderLabels = folderNodes.map((child) => child.label);
		expect(folderLabels).toContain("repos");

		const leafLabels = ancestorChildren
			.filter((child) => child instanceof BookmarkTreeItem)
			.map((child) => child.label);
		expect(leafLabels).toContain("README.md");
	});

	it("refreshes when the view mode changes", () => {
		const entry: BookmarkEntry = {
			label: "notes.md",
			type: "file",
			uri: "file:///workspace/notes.md",
		};

		const { store } = createStore([entry]);
		const { store: viewModeStore, setMode } = createViewModeStore("list");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);
		const listener = vi.fn();

		provider.onDidChangeTreeData(listener);
		setMode("tree");

		expect(listener).toHaveBeenCalledWith(undefined);
		provider.dispose();
	});
});

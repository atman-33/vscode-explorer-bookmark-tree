import { describe, expect, it, vi } from "vitest";
import { TreeItemCollapsibleState } from "vscode";
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
		reorder: (sourceUris, targetUri) => {
			const moving = entries.filter((entry) => sourceUris.includes(entry.uri));
			if (moving.length === 0) {
				return Promise.resolve();
			}

			const remaining = entries.filter(
				(entry) => !sourceUris.includes(entry.uri)
			);

			let targetIndex =
				targetUri === undefined
					? remaining.length
					: remaining.findIndex((entry) => entry.uri === targetUri);

			if (targetIndex < 0) {
				targetIndex = remaining.length;
			}

			entries = [
				...remaining.slice(0, targetIndex),
				...moving,
				...remaining.slice(targetIndex),
			];

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

	it("preserves stored order when rendering list mode", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "third.txt",
				type: "file",
				uri: "file:///repo/third.txt",
			},
			{
				label: "first.txt",
				type: "file",
				uri: "file:///repo/first.txt",
			},
			{
				label: "second.txt",
				type: "file",
				uri: "file:///repo/second.txt",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("list");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);

		const labels = provider
			.getChildren()
			.map((child) => (child as BookmarkTreeItem).label);

		expect(labels).toEqual(entries.map((entry) => entry.label));
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
		const expectedTopLevelChildren = 2;
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
		expect(leafLabels).toEqual([]);

		const srcNode = folderNodes.find((child) => child.label === "src");
		const srcChildren = srcNode ? provider.getChildren(srcNode) : [];
		const srcLeafLabels = srcChildren
			.filter((child) => child instanceof BookmarkTreeItem)
			.map((child) => child.label);
		expect(srcLeafLabels).toContain("src/index.ts");
	});

	it("omits folder bookmark when parent folder is already represented", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "src/index.ts",
				type: "file",
				uri: "file:///home/atman/repos/atman-prompts/src/index.ts",
			},
			{
				label: "src",
				type: "folder",
				uri: "file:///home/atman/repos/atman-prompts/src",
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
		const rootFolder = topLevel[0];
		expect(rootFolder).toBeInstanceOf(BookmarkFolderTreeItem);

		const rootChildren = provider.getChildren(
			rootFolder as BookmarkFolderTreeItem
		);
		const folderLeafLabels = rootChildren
			.filter((child) => child instanceof BookmarkTreeItem)
			.map((child) => child.label);
		expect(folderLeafLabels).toEqual(["src/index.ts"]);
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

	it("respects stored order when rendering tree leaves within folders", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "docs/guide.md",
				type: "file",
				uri: "file:///repo/docs/guide.md",
			},
			{
				label: "docs/api.md",
				type: "file",
				uri: "file:///repo/docs/api.md",
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
		const root = topLevel[0] as BookmarkFolderTreeItem;
		const leaves = provider
			.getChildren(root)
			.filter(
				(child): child is BookmarkTreeItem => child instanceof BookmarkTreeItem
			)
			.map((child) => child.label);

		expect(leaves).toEqual(entries.map((entry) => entry.label));
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

	it("compacts linear folder chains in tree mode", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "webview-ui/src/app.css",
				type: "file",
				uri: "file:///repo/webview-ui/src/app.css",
			},
			{
				label: "README.md",
				type: "file",
				uri: "file:///repo/README.md",
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
		expect(repoChildren).toHaveLength(2);

		// Find the compacted folder
		const compactedFolder = repoChildren.find(
			(child) =>
				child instanceof BookmarkFolderTreeItem &&
				child.label === "webview-ui/src"
		);
		expect(compactedFolder).toBeDefined();
		expect(compactedFolder).toBeInstanceOf(BookmarkFolderTreeItem);

		const folderChildren = provider.getChildren(
			compactedFolder as BookmarkFolderTreeItem
		);
		expect(folderChildren).toHaveLength(1);

		const leafNode = folderChildren[0];
		expect(leafNode).toBeInstanceOf(BookmarkTreeItem);
		expect(leafNode.label).toBe("webview-ui/src/app.css");

		provider.dispose();
	});
	it("does not compact folders when there are multiple branches", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "repo/src/index.ts",
				type: "file",
				uri: "file:///repo/src/index.ts",
			},
			{
				label: "repo/docs/guide.md",
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

		const repoChildren = provider.getChildren(
			repoFolder as BookmarkFolderTreeItem
		);
		expect(repoChildren).toHaveLength(2);

		const folderNodes = repoChildren.filter(
			(child) => child instanceof BookmarkFolderTreeItem
		) as BookmarkFolderTreeItem[];
		expect(folderNodes).toHaveLength(2);

		const folderLabels = folderNodes.map((child) => child.label);
		expect(folderLabels).toContain("src");
		expect(folderLabels).toContain("docs");

		provider.dispose();
	});

	it("compacts partial folder chains until branches diverge", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "repo/src/components/Button.tsx",
				type: "file",
				uri: "file:///workspace/repo/src/components/Button.tsx",
			},
			{
				label: "repo/src/utils/helpers.ts",
				type: "file",
				uri: "file:///workspace/repo/src/utils/helpers.ts",
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
		const srcFolder = topLevel[0];
		expect(srcFolder).toBeInstanceOf(BookmarkFolderTreeItem);
		expect(srcFolder.label).toBe("src");

		const srcChildren = provider.getChildren(
			srcFolder as BookmarkFolderTreeItem
		);
		expect(srcChildren).toHaveLength(2);

		const folderLabels = srcChildren
			.filter((child) => child instanceof BookmarkFolderTreeItem)
			.map((child) => child.label);
		expect(folderLabels).toContain("components");
		expect(folderLabels).toContain("utils");

		provider.dispose();
	});

	it("expands and collapses all folders via the provider", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "repo/docs/guide.md",
				type: "file",
				uri: "file:///repo/docs/guide.md",
			},
			{
				label: "repo/src/index.ts",
				type: "file",
				uri: "file:///repo/src/index.ts",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("tree");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);

		provider.expandAllFolders();
		const [root] = provider.getChildren();
		expect(root).toBeInstanceOf(BookmarkFolderTreeItem);
		expect((root as BookmarkFolderTreeItem).collapsibleState).toBe(
			TreeItemCollapsibleState.Expanded
		);

		provider.collapseAllFolders();
		const [collapsedRoot] = provider.getChildren();
		expect(collapsedRoot).toBeInstanceOf(BookmarkFolderTreeItem);
		expect((collapsedRoot as BookmarkFolderTreeItem).collapsibleState).toBe(
			TreeItemCollapsibleState.Collapsed
		);

		provider.dispose();
	});

	it("tracks manual folder expansion state", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "repo/src/components/Button.tsx",
				type: "file",
				uri: "file:///repo/src/components/Button.tsx",
			},
			{
				label: "repo/src/utils/helpers.ts",
				type: "file",
				uri: "file:///repo/src/utils/helpers.ts",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore, setMode } = createViewModeStore("tree");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);
		const [root] = provider.getChildren();
		expect(root).toBeInstanceOf(BookmarkFolderTreeItem);

		if (root instanceof BookmarkFolderTreeItem) {
			provider.markFolderExpanded(root);
		}

		let state = provider.getFolderExpansionState();
		expect(state).toEqual({
			hasFolders: true,
			anyExpanded: true,
			allCollapsed: false,
		});

		if (root instanceof BookmarkFolderTreeItem) {
			provider.markFolderCollapsed(root);
		}

		state = provider.getFolderExpansionState();
		expect(state).toEqual({
			hasFolders: true,
			anyExpanded: false,
			allCollapsed: true,
		});

		setMode("list");
		state = provider.getFolderExpansionState();
		expect(state).toEqual({
			hasFolders: false,
			anyExpanded: false,
			allCollapsed: true,
		});

		provider.dispose();
	});

	it("resolves parent nodes in tree mode", () => {
		const entries: BookmarkEntry[] = [
			{
				label: "repo/docs/guide.md",
				type: "file",
				uri: "file:///repo/docs/guide.md",
			},
			{
				label: "repo/src/utils/index.ts",
				type: "file",
				uri: "file:///repo/src/utils/index.ts",
			},
		];

		const { store } = createStore(entries);
		const { store: viewModeStore } = createViewModeStore("tree");
		const provider = new BookmarkTreeDataProvider(
			store,
			"explorerBookmarkTree.openBookmark",
			viewModeStore
		);

		const [root] = provider.getChildren();
		expect(root).toBeInstanceOf(BookmarkFolderTreeItem);

		if (!(root instanceof BookmarkFolderTreeItem)) {
			throw new Error("Missing root folder");
		}

		const rootChildren = provider.getChildren(root);
		const compactedFolder = rootChildren.find(
			(child) =>
				child instanceof BookmarkFolderTreeItem && child.label === "src/utils"
		) as BookmarkFolderTreeItem | undefined;

		expect(compactedFolder).toBeInstanceOf(BookmarkFolderTreeItem);
		expect(provider.getParent(compactedFolder!)).toBe(root);

		const nestedChildren = provider.getChildren(compactedFolder!);
		const fileNode = nestedChildren.find(
			(child) => child instanceof BookmarkTreeItem
		) as BookmarkTreeItem | undefined;

		expect(fileNode).toBeInstanceOf(BookmarkTreeItem);
		expect(provider.getParent(fileNode!)).toBe(compactedFolder);
		expect(provider.getParent(root)).toBeUndefined();

		provider.dispose();
	});
});

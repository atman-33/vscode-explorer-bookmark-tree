import { describe, expect, it, vi } from "vitest";
import { commands, type Disposable, type TreeView, Uri } from "vscode";
import {
	BookmarkFolderTreeItem,
	type BookmarkTreeDataProvider,
	type BookmarkTreeNode,
} from "../providers/bookmark-tree-data-provider";
import { BOOKMARK_TREE_VIEW_ID } from "../constants";
import {
	COLLAPSE_ALL_FOLDERS_COMMAND_ID,
	EXPAND_ALL_FOLDERS_COMMAND_ID,
	TOGGLE_EXPAND_COLLAPSE_COMMAND_ID,
	registerExpandCollapseCommands,
	registerToggleExpandCollapseCommand,
} from "./toggle-expand-collapse";

const MAX_REVEAL_ATTEMPTS = 5;

describe("registerToggleExpandCollapseCommand", () => {
	const createProvider = (
		overrides: Partial<BookmarkTreeDataProvider>
	): BookmarkTreeDataProvider =>
		({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: true,
				anyExpanded: false,
				allCollapsed: true,
			})),
			expandAllFolders: vi.fn(() => true),
			collapseAllFolders: vi.fn(() => true),
			getChildren: vi.fn(() => []),
			...overrides,
		}) as unknown as BookmarkTreeDataProvider;

	it("expands all folders when every folder is collapsed", async () => {
		const rootFolder = new BookmarkFolderTreeItem(
			"/repo",
			Uri.parse("file:///repo"),
			["repo"]
		);
		const childFolder = new BookmarkFolderTreeItem(
			"src",
			Uri.parse("file:///repo/src"),
			["repo", "src"]
		);
		const getChildren = vi.fn((element?: BookmarkTreeNode) => {
			if (!element) {
				return [rootFolder];
			}

			if (element === rootFolder) {
				return [childFolder];
			}

			return [];
		});

		const provider = createProvider({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: true,
				anyExpanded: false,
				allCollapsed: true,
			})),
			expandAllFolders: vi.fn(() => true),
			getChildren,
		});
		const treeView: TreeView<BookmarkTreeNode> = {
			reveal: vi.fn(async () => {
				/* noop */
			}),
		} as unknown as TreeView<BookmarkTreeNode>;

		let handler: (() => Promise<void>) | undefined;
		const registration: Disposable = { dispose: vi.fn() };
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(TOGGLE_EXPAND_COLLAPSE_COMMAND_ID);
				handler = callback;
				return registration;
			});

		const disposable = registerToggleExpandCollapseCommand(provider, treeView);

		expect(handler).toBeDefined();
		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);
		await handler?.();

		expect(provider.expandAllFolders).toHaveBeenCalledTimes(1);
		expect(provider.collapseAllFolders).not.toHaveBeenCalled();
		expect(treeView.reveal).toHaveBeenCalledWith(
			rootFolder,
			expect.objectContaining({ expand: true })
		);
		expect(treeView.reveal).toHaveBeenCalledWith(
			childFolder,
			expect.objectContaining({ expand: true })
		);
		expect(commands.executeCommand).toHaveBeenCalledWith(
			"setContext",
			"explorerBookmarkTree:expandCollapseAction",
			"collapse"
		);
		expect(commands.executeCommand).not.toHaveBeenCalledWith(
			`workbench.actions.treeView.${BOOKMARK_TREE_VIEW_ID}.collapseAll`
		);

		disposable.dispose();
		expect(registration.dispose).toHaveBeenCalled();
		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});

	it("rejects when revealing a folder fails", async () => {
		const rootFolder = new BookmarkFolderTreeItem(
			"/repo",
			Uri.parse("file:///repo"),
			["repo"]
		);
		const provider = createProvider({
			getChildren: vi.fn((element?: BookmarkTreeNode) => {
				if (!element) {
					return [rootFolder];
				}

				return [];
			}),
		});
		const revealError = new Error("reveal failed");
		const treeView: TreeView<BookmarkTreeNode> = {
			reveal: vi.fn(() => Promise.reject(revealError)),
		} as unknown as TreeView<BookmarkTreeNode>;

		let handler: (() => Promise<void>) | undefined;
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				expect(identifier).toBe(TOGGLE_EXPAND_COLLAPSE_COMMAND_ID);
				handler = callback;
				return { dispose: vi.fn() } as Disposable;
			});

		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);

		registerToggleExpandCollapseCommand(provider, treeView);
		expect(handler).toBeDefined();

		await expect(handler?.()).rejects.toThrow(
			'Failed to reveal folder "/repo" in the bookmarks tree: reveal failed'
		);
		expect(provider.expandAllFolders).toHaveBeenCalledTimes(1);
		expect(treeView.reveal).toHaveBeenCalledTimes(MAX_REVEAL_ATTEMPTS);
		expect(commands.executeCommand).not.toHaveBeenCalledWith(
			"setContext",
			"explorerBookmarkTree:expandCollapseAction",
			"collapse"
		);

		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});

	it("collapses all folders when any folder is expanded", async () => {
		const provider = createProvider({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: true,
				anyExpanded: true,
				allCollapsed: false,
			})),
		});
		const treeView: TreeView<BookmarkTreeNode> = {
			reveal: vi.fn(async () => {
				/* noop */
			}),
		} as unknown as TreeView<BookmarkTreeNode>;

		let handler: (() => Promise<void>) | undefined;
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((_identifier, callback) => {
				handler = callback;
				return { dispose: vi.fn() } as Disposable;
			});

		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);
		registerToggleExpandCollapseCommand(provider, treeView);
		expect(handler).toBeDefined();

		await handler?.();

		expect(provider.collapseAllFolders).toHaveBeenCalledTimes(1);
		expect(provider.expandAllFolders).not.toHaveBeenCalled();
		expect(commands.executeCommand).toHaveBeenCalledWith(
			`workbench.actions.treeView.${BOOKMARK_TREE_VIEW_ID}.collapseAll`
		);
		expect(commands.executeCommand).toHaveBeenCalledWith(
			"setContext",
			"explorerBookmarkTree:expandCollapseAction",
			"expand"
		);
		expect(treeView.reveal).not.toHaveBeenCalled();

		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});

	it("does not toggle when no folders exist", async () => {
		const provider = createProvider({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: false,
				anyExpanded: false,
				allCollapsed: true,
			})),
		});
		const treeView: TreeView<BookmarkTreeNode> = {
			reveal: vi.fn(async () => {
				/* noop */
			}),
		} as unknown as TreeView<BookmarkTreeNode>;

		let handler: (() => Promise<void>) | undefined;
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((_identifier, callback) => {
				handler = callback;
				return { dispose: vi.fn() } as Disposable;
			});

		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);
		registerToggleExpandCollapseCommand(provider, treeView);
		expect(handler).toBeDefined();

		await handler?.();

		expect(provider.expandAllFolders).not.toHaveBeenCalled();
		expect(provider.collapseAllFolders).not.toHaveBeenCalled();
		expect(treeView.reveal).not.toHaveBeenCalled();
		expect(commands.executeCommand).not.toHaveBeenCalled();

		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});
});

describe("registerExpandCollapseCommands", () => {
	const createProvider = (
		overrides: Partial<BookmarkTreeDataProvider>
	): BookmarkTreeDataProvider =>
		({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: true,
				anyExpanded: false,
				allCollapsed: true,
			})),
			expandAllFolders: vi.fn(() => true),
			collapseAllFolders: vi.fn(() => true),
			getChildren: vi.fn(() => []),
			...overrides,
		}) as unknown as BookmarkTreeDataProvider;

	const createTreeView = () =>
		({
			reveal: vi.fn(async () => {
				/* noop */
			}),
		}) as unknown as TreeView<BookmarkTreeNode>;

	it("expands folders when expand command executes", async () => {
		const provider = createProvider({
			getChildren: vi.fn(() => []),
		});
		const treeView = createTreeView();
		const handlers = new Map<string, () => Promise<void>>();
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				handlers.set(identifier, callback as () => Promise<void>);
				return { dispose: vi.fn() } as unknown as Disposable;
			});
		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);

		const disposable = registerExpandCollapseCommands(provider, treeView);

		const expandHandler = handlers.get(EXPAND_ALL_FOLDERS_COMMAND_ID);
		expect(expandHandler).toBeDefined();
		await expandHandler?.();

		expect(provider.expandAllFolders).toHaveBeenCalledTimes(1);
		expect(treeView.reveal).not.toHaveBeenCalled();
		expect(commands.executeCommand).toHaveBeenCalledWith(
			"setContext",
			"explorerBookmarkTree:expandCollapseAction",
			"collapse"
		);

		disposable.dispose();
		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});

	it("collapses folders when collapse command executes", async () => {
		const provider = createProvider({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: true,
				anyExpanded: true,
				allCollapsed: false,
			})),
		});
		const treeView = createTreeView();
		const handlers = new Map<string, () => Promise<void>>();
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				handlers.set(identifier, callback as () => Promise<void>);
				return { dispose: vi.fn() } as unknown as Disposable;
			});
		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);

		const disposable = registerExpandCollapseCommands(provider, treeView);

		const collapseHandler = handlers.get(COLLAPSE_ALL_FOLDERS_COMMAND_ID);
		expect(collapseHandler).toBeDefined();
		await collapseHandler?.();

		expect(provider.collapseAllFolders).toHaveBeenCalledTimes(1);
		expect(commands.executeCommand).toHaveBeenCalledWith(
			`workbench.actions.treeView.${BOOKMARK_TREE_VIEW_ID}.collapseAll`
		);
		expect(commands.executeCommand).toHaveBeenCalledWith(
			"setContext",
			"explorerBookmarkTree:expandCollapseAction",
			"expand"
		);
		expect(treeView.reveal).not.toHaveBeenCalled();

		disposable.dispose();
		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});

	it("no-ops when folders are unavailable", async () => {
		const provider = createProvider({
			getFolderExpansionState: vi.fn(() => ({
				hasFolders: false,
				anyExpanded: false,
				allCollapsed: true,
			})),
		});
		const treeView = createTreeView();
		const handlers = new Map<string, () => Promise<void>>();
		const registerSpy = vi
			.spyOn(commands, "registerCommand")
			.mockImplementation((identifier, callback) => {
				handlers.set(identifier, callback as () => Promise<void>);
				return { dispose: vi.fn() } as unknown as Disposable;
			});
		const executeSpy = vi
			.spyOn(commands, "executeCommand")
			.mockResolvedValue(undefined);

		registerExpandCollapseCommands(provider, treeView);

		await handlers.get(EXPAND_ALL_FOLDERS_COMMAND_ID)?.();
		await handlers.get(COLLAPSE_ALL_FOLDERS_COMMAND_ID)?.();

		expect(provider.expandAllFolders).not.toHaveBeenCalled();
		expect(provider.collapseAllFolders).not.toHaveBeenCalled();
		expect(commands.executeCommand).not.toHaveBeenCalled();

		registerSpy.mockRestore();
		executeSpy.mockRestore();
	});
});

import { commands, Disposable, type TreeView } from "vscode";
import {
	BOOKMARK_EXPAND_COLLAPSE_ACTION_CONTEXT_KEY,
	BOOKMARK_NAMESPACE,
	BOOKMARK_TREE_VIEW_ID,
} from "../constants";
import type {
	BookmarkTreeDataProvider,
	BookmarkTreeNode,
} from "../providers/bookmark-tree-data-provider";
import { BookmarkFolderTreeItem } from "../providers/bookmark-tree-data-provider";

export const TOGGLE_EXPAND_COLLAPSE_COMMAND_ID = `${BOOKMARK_NAMESPACE}.toggleExpandCollapse`;
export const EXPAND_ALL_FOLDERS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.expandAllFolders`;
export const COLLAPSE_ALL_FOLDERS_COMMAND_ID = `${BOOKMARK_NAMESPACE}.collapseAllFolders`;

const COLLAPSE_TREE_COMMAND_ID = `workbench.actions.treeView.${BOOKMARK_TREE_VIEW_ID}.collapseAll`;

type FolderExpansionState = ReturnType<
	BookmarkTreeDataProvider["getFolderExpansionState"]
>;

const resolveAction = (state: FolderExpansionState) => {
	if (!state.hasFolders) {
		return "idle" as const;
	}

	return state.anyExpanded ? "collapse" : "expand";
};

const setNextActionContext = async (action: "expand" | "collapse") => {
	await commands.executeCommand(
		"setContext",
		BOOKMARK_EXPAND_COLLAPSE_ACTION_CONTEXT_KEY,
		action
	);
};

const waitForNextTick = () =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, 0);
	});

const revealFolderNode = async (
	treeView: TreeView<BookmarkTreeNode>,
	node: BookmarkFolderTreeItem
) => {
	const maxAttempts = 5;
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		try {
			await treeView.reveal(node, {
				expand: true,
				focus: false,
				select: false,
			});
			return true;
		} catch {
			if (attempt === maxAttempts - 1) {
				break;
			}

			await waitForNextTick();
		}
	}

	return false;
};

const expandFolderNodes = async (
	treeProvider: BookmarkTreeDataProvider,
	treeView: TreeView<BookmarkTreeNode>,
	nodes: BookmarkTreeNode[],
	visited: Set<string>
) => {
	for (const node of nodes) {
		if (!(node instanceof BookmarkFolderTreeItem)) {
			continue;
		}

		const nodeId = node.id ?? node.folderUri.toString();
		if (visited.has(nodeId)) {
			continue;
		}

		visited.add(nodeId);

		await revealFolderNode(treeView, node);

		const children = treeProvider.getChildren(node);
		if (children.length > 0) {
			await expandFolderNodes(treeProvider, treeView, children, visited);
		}
	}
};

const expandEntireTree = async (
	treeProvider: BookmarkTreeDataProvider,
	treeView: TreeView<BookmarkTreeNode>
) => {
	await waitForNextTick();
	const rootNodes = treeProvider.getChildren();
	if (rootNodes.length === 0) {
		return;
	}

	const visited = new Set<string>();
	await expandFolderNodes(treeProvider, treeView, rootNodes, visited);
};

const collapseTree = async (treeProvider: BookmarkTreeDataProvider) => {
	treeProvider.collapseAllFolders();
	await commands.executeCommand(COLLAPSE_TREE_COMMAND_ID);
	await setNextActionContext("expand");
};

const expandTree = async (
	treeProvider: BookmarkTreeDataProvider,
	treeView: TreeView<BookmarkTreeNode>
) => {
	treeProvider.expandAllFolders();
	await expandEntireTree(treeProvider, treeView);
	await setNextActionContext("collapse");
};

export const registerToggleExpandCollapseCommand = (
	treeProvider: BookmarkTreeDataProvider,
	treeView: TreeView<BookmarkTreeNode>
): Disposable => {
	const disposable = commands.registerCommand(
		TOGGLE_EXPAND_COLLAPSE_COMMAND_ID,
		async () => {
			const state = treeProvider.getFolderExpansionState();
			const action = resolveAction(state);

			if (action === "idle") {
				return;
			}

			if (action === "collapse") {
				await collapseTree(treeProvider);
			} else {
				await expandTree(treeProvider, treeView);
			}
		}
	);

	return disposable;
};

export const registerExpandCollapseCommands = (
	treeProvider: BookmarkTreeDataProvider,
	treeView: TreeView<BookmarkTreeNode>
): Disposable => {
	const expandCommand = commands.registerCommand(
		EXPAND_ALL_FOLDERS_COMMAND_ID,
		async () => {
			if (!treeProvider.getFolderExpansionState().hasFolders) {
				return;
			}

			await expandTree(treeProvider, treeView);
		}
	);

	const collapseCommand = commands.registerCommand(
		COLLAPSE_ALL_FOLDERS_COMMAND_ID,
		async () => {
			if (!treeProvider.getFolderExpansionState().hasFolders) {
				return;
			}

			await collapseTree(treeProvider);
		}
	);

	return Disposable.from(expandCommand, collapseCommand);
};

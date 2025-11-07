import {
	EventEmitter,
	ThemeIcon,
	TreeItem,
	TreeItemCollapsibleState,
	Uri,
} from "vscode";
import type { Disposable, Event, TreeDataProvider } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";
import type {
	BookmarkViewMode,
	BookmarkViewModeStore,
} from "../bookmarks/view-mode-store";

export type BookmarkTreeNode = BookmarkTreeItem | BookmarkFolderTreeItem;
interface ParsedBookmark {
	entry: BookmarkEntry;
	segments: string[];
	uri: Uri;
}

const toSegments = (uri: Uri) => uri.path.split("/").filter(Boolean);

const findCommonPrefix = (lists: string[][]) => {
	if (lists.length === 0) {
		return [];
	}

	let prefix = [...lists[0]];
	for (let index = 1; index < lists.length; index += 1) {
		const current = lists[index];
		let matched = 0;
		while (
			matched < prefix.length &&
			matched < current.length &&
			prefix[matched] === current[matched]
		) {
			matched += 1;
		}

		prefix = prefix.slice(0, matched);
		if (prefix.length === 0) {
			break;
		}
	}

	return prefix;
};

const createFolderUri = (base: Uri, segments: string[]) =>
	base.with({ path: `/${segments.join("/")}` });

const shouldCreateRootFolder = (
	element: BookmarkTreeNode | undefined,
	commonSegments: string[],
	count: number
) => !element && commonSegments.length > 0 && count > 1;

const resolveParentSegments = (
	element: BookmarkTreeNode | undefined,
	commonSegments: string[]
) => {
	if (element instanceof BookmarkFolderTreeItem) {
		return element.segments;
	}

	return commonSegments.length > 0 ? commonSegments : undefined;
};

// Helper function to check if an entry matches the given folder segments
const matchesFolderPath = (
	entrySegments: string[],
	folderSegments: string[]
): boolean => {
	if (entrySegments.length <= folderSegments.length) {
		return false;
	}

	for (let i = 0; i < folderSegments.length; i += 1) {
		if (entrySegments[i] !== folderSegments[i]) {
			return false;
		}
	}

	return true;
};

// Helper function to detect compactable folder chains
const detectCompactChain = (
	folderSegments: string[],
	allEntries: ParsedBookmark[]
): string[] => {
	const compactedSegments = [...folderSegments];
	let currentDepth = folderSegments.length;

	// Keep extending the chain while there's exactly one child folder and no leaves
	while (true) {
		const childFolders = new Set<string>();
		let hasLeaves = false;

		for (const { segments } of allEntries) {
			// Check if this entry is a descendant of current folder
			if (!matchesFolderPath(segments, compactedSegments)) {
				continue;
			}

			// If it's exactly at the next depth level, it's either a leaf or a direct child folder
			if (segments.length === currentDepth + 1) {
				hasLeaves = true;
			} else {
				// It's a descendant, track the immediate child folder
				const childKey = segments.slice(0, currentDepth + 1).join("/");
				childFolders.add(childKey);
			}
		}

		// Stop if there are multiple child folders or any leaves at this level
		if (childFolders.size !== 1 || hasLeaves) {
			break;
		}

		// Extend the compact chain
		const singleChild = Array.from(childFolders)[0].split("/");
		compactedSegments.push(singleChild[currentDepth]);
		currentDepth += 1;
	}

	return compactedSegments;
};

// biome-ignore lint/nursery/useMaxParams: ignore
const partitionTreeNodes = (
	entries: ParsedBookmark[],
	parentSegments: string[] | undefined,
	depth: number,
	openCommandId: string,
	shouldExcludeParentFolder: boolean
) => {
	const folderMap = new Map<
		string,
		{ label: string; uri: Uri; segments: string[]; compactedSegments: string[] }
	>();
	const folderOrder: string[] = [];
	const leafEntries: ParsedBookmark[] = [];

	for (const { entry, uri, segments } of entries) {
		if (!matchesParent(segments, parentSegments)) {
			continue;
		}

		if (segments.length > depth + 1) {
			const folderSegments = segments.slice(0, depth + 1);
			const key = folderSegments.join("/");
			if (!folderMap.has(key)) {
				const folderUri = createFolderUri(uri, folderSegments);
				folderMap.set(key, {
					label: createFolderLabel(folderSegments),
					uri: folderUri,
					segments: folderSegments,
					compactedSegments: folderSegments,
				});
				folderOrder.push(key);
			}
			continue;
		}

		leafEntries.push({ entry, uri, segments });
	}

	// Detect and apply folder compaction
	for (const key of folderOrder) {
		const folder = folderMap.get(key);
		if (!folder) {
			continue;
		}

		const compactedSegments = detectCompactChain(folder.segments, entries);
		if (compactedSegments.length > folder.segments.length) {
			folder.compactedSegments = compactedSegments;
			folder.label = compactedSegments.slice(depth).join("/");
			folder.uri = createFolderUri(folder.uri, compactedSegments);
		}
	}

	const folders = folderOrder.map((key) => {
		const folder = folderMap.get(key);
		if (!folder) {
			throw new Error(`Missing folder for key: ${key}`);
		}

		return new BookmarkFolderTreeItem(
			folder.label,
			folder.uri,
			folder.compactedSegments
		);
	});

	const leaves = leafEntries
		.filter(({ entry, segments }) => {
			if (
				shouldExcludeParentFolder &&
				entry.type === "folder" &&
				parentSegments &&
				segments.length === depth &&
				matchesParent(segments, parentSegments)
			) {
				return false;
			}

			if (entry.type === "folder" && folderMap.has(segments.join("/"))) {
				return false;
			}

			return true;
		})
		.map(({ entry }) => new BookmarkTreeItem(entry, openCommandId));

	return { folders, leaves };
};

const matchesParent = (
	segments: string[],
	parentSegments: string[] | undefined
) => {
	if (!parentSegments || parentSegments.length === 0) {
		return true;
	}

	if (segments.length < parentSegments.length) {
		return false;
	}

	return parentSegments.every((segment, index) => segment === segments[index]);
};

const createFolderLabel = (segments: string[]) => {
	if (segments.length === 0) {
		return "/";
	}

	if (segments.length === 1) {
		return `/${segments[0]}`;
	}

	return segments.at(-1)!;
};

export class BookmarkTreeItem extends TreeItem {
	readonly resource: Uri;
	readonly bookmark: BookmarkEntry;
	readonly kind = "bookmark";

	constructor(bookmark: BookmarkEntry, commandId: string) {
		super(bookmark.label, TreeItemCollapsibleState.None);
		this.bookmark = bookmark;
		this.id = bookmark.uri;
		this.resource = Uri.parse(bookmark.uri);
		this.resourceUri = this.resource;
		this.tooltip = this.resource.fsPath;
		this.contextValue = `bookmark:${bookmark.type}`;
		this.iconPath =
			bookmark.type === "folder" ? ThemeIcon.Folder : ThemeIcon.File;
		this.command = {
			arguments: [this.resource, bookmark.type],
			command: commandId,
			title: "Open Bookmark",
		};
	}
}

export class BookmarkFolderTreeItem extends TreeItem {
	readonly kind = "folder";
	readonly segments: string[];
	readonly folderUri: Uri;

	constructor(label: string, uri: Uri, segments: string[]) {
		super(label, TreeItemCollapsibleState.Collapsed);
		this.segments = segments;
		this.folderUri = uri;
		this.id = `folder:${uri.toString()}`;
		this.resourceUri = uri;
		this.tooltip = uri.fsPath;
		this.iconPath = ThemeIcon.Folder;
		this.contextValue = "bookmark:container";
	}
}

export class BookmarkTreeDataProvider
	implements TreeDataProvider<BookmarkTreeNode>, Disposable
{
	private readonly emitter = new EventEmitter<BookmarkTreeNode | undefined>();
	private readonly storeSubscription: Disposable;
	private readonly viewModeSubscription: Disposable;
	private readonly store: BookmarkStore;
	private readonly openCommandId: string;
	private readonly viewModeStore: BookmarkViewModeStore;
	private mode: BookmarkViewMode;

	constructor(
		store: BookmarkStore,
		openCommandId: string,
		viewModeStore: BookmarkViewModeStore
	) {
		this.store = store;
		this.openCommandId = openCommandId;
		this.viewModeStore = viewModeStore;
		this.mode = this.viewModeStore.getMode();

		this.storeSubscription = this.store.onDidChange(() => {
			this.emitter.fire(undefined);
		});

		this.viewModeSubscription = this.viewModeStore.onDidChange((mode) => {
			this.mode = mode;
			this.emitter.fire(undefined);
		});
	}

	readonly onDidChangeTreeData: Event<BookmarkTreeNode | undefined> =
		this.emitter.event;

	getTreeItem = (element: BookmarkTreeNode) => element;

	getChildren = (element?: BookmarkTreeNode): BookmarkTreeNode[] => {
		if (this.mode === "list") {
			return element ? [] : this.getListChildren();
		}

		return this.getTreeChildren(element);
	};

	dispose = () => {
		this.storeSubscription.dispose();
		this.viewModeSubscription.dispose();
		this.emitter.dispose();
	};

	private readonly getListChildren = () =>
		this.store
			.getAll()
			.map((bookmark) => new BookmarkTreeItem(bookmark, this.openCommandId));

	private readonly getTreeChildren = (
		element?: BookmarkTreeNode
	): BookmarkTreeNode[] => {
		const entries = this.store.getAll();
		if (entries.length === 0) {
			return [];
		}

		const parsedEntries = entries.map((entry): ParsedBookmark => {
			const uri = Uri.parse(entry.uri);
			return {
				entry,
				uri,
				segments: toSegments(uri),
			};
		});

		const commonSegments = findCommonPrefix(
			parsedEntries.map((item) =>
				item.entry.type === "file"
					? item.segments.slice(0, Math.max(0, item.segments.length - 1))
					: item.segments
			)
		);

		if (shouldCreateRootFolder(element, commonSegments, parsedEntries.length)) {
			const baseUri = createFolderUri(parsedEntries[0].uri, commonSegments);
			return [
				new BookmarkFolderTreeItem(
					createFolderLabel(commonSegments),
					baseUri,
					commonSegments
				),
			];
		}

		const parentSegments = resolveParentSegments(element, commonSegments);
		const depth = parentSegments ? parentSegments.length : 0;
		const shouldExcludeParentFolder = element instanceof BookmarkFolderTreeItem;

		const { folders, leaves } = partitionTreeNodes(
			parsedEntries,
			parentSegments,
			depth,
			this.openCommandId,
			shouldExcludeParentFolder
		);

		return [...folders, ...leaves];
	};

	getMode = () => this.mode;
}

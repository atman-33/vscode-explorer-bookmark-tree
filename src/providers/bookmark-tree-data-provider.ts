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

const toSegments = (uri: Uri) => uri.path.split("/").filter(Boolean);

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
		const parentSegments =
			element && element instanceof BookmarkFolderTreeItem
				? element.segments
				: undefined;
		const depth = parentSegments ? parentSegments.length : 0;

		const entries = this.store.getAll();
		if (entries.length === 0) {
			return [];
		}

		const folderMap = new Map<
			string,
			{ label: string; uri: Uri; segments: string[] }
		>();
		const leaves: BookmarkTreeItem[] = [];

		for (const entry of entries) {
			const uri = Uri.parse(entry.uri);
			const segments = toSegments(uri);
			if (!matchesParent(segments, parentSegments)) {
				continue;
			}

			if (segments.length > depth + 1) {
				const folderSegments = segments.slice(0, depth + 1);
				const key = folderSegments.join("/");
				if (!folderMap.has(key)) {
					const folderUri = uri.with({
						path: `/${folderSegments.join("/")}`,
					});
					folderMap.set(key, {
						label: createFolderLabel(folderSegments),
						uri: folderUri,
						segments: folderSegments,
					});
				}
				continue;
			}

			leaves.push(new BookmarkTreeItem(entry, this.openCommandId));
		}

		const folders = Array.from(folderMap.values())
			.sort((a, b) => a.label.localeCompare(b.label))
			.map(
				(folder) =>
					new BookmarkFolderTreeItem(folder.label, folder.uri, folder.segments)
			);

		const sortedLeaves = leaves.sort((a, b) => {
			const aLabel = a.label?.toString() ?? "";
			const bLabel = b.label?.toString() ?? "";
			return aLabel.localeCompare(bLabel);
		});

		return [...folders, ...sortedLeaves];
	};
}

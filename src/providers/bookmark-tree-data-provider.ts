import {
	EventEmitter,
	ThemeIcon,
	TreeItem,
	TreeItemCollapsibleState,
	Uri,
} from "vscode";
import type { Disposable, Event, TreeDataProvider } from "vscode";
import type { BookmarkEntry, BookmarkStore } from "../bookmarks/bookmark-store";

export class BookmarkTreeItem extends TreeItem {
	readonly resource: Uri;
	readonly bookmark: BookmarkEntry;

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

export class BookmarkTreeDataProvider
	implements TreeDataProvider<BookmarkTreeItem>, Disposable
{
	private readonly emitter = new EventEmitter<BookmarkTreeItem | undefined>();
	private readonly subscription: Disposable;
	private readonly store: BookmarkStore;
	private readonly openCommandId: string;

	constructor(store: BookmarkStore, openCommandId: string) {
		this.store = store;
		this.openCommandId = openCommandId;
		this.subscription = this.store.onDidChange(() => {
			this.emitter.fire(undefined);
		});
	}

	readonly onDidChangeTreeData: Event<BookmarkTreeItem | undefined> =
		this.emitter.event;

	getTreeItem = (element: BookmarkTreeItem) => element;

	getChildren = () =>
		this.store
			.getAll()
			.map((bookmark) => new BookmarkTreeItem(bookmark, this.openCommandId));

	dispose = () => {
		this.subscription.dispose();
		this.emitter.dispose();
	};
}

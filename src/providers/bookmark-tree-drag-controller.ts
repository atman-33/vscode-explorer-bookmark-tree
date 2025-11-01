import { DataTransferItem } from "vscode";
import type {
	CancellationToken,
	DataTransfer,
	Disposable,
	TreeDragAndDropController,
} from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import type { BookmarkViewMode } from "../bookmarks/view-mode-store";
import { BookmarkTreeItem } from "./bookmark-tree-data-provider";
import type { BookmarkTreeNode } from "./bookmark-tree-data-provider";

const TREE_MIME_TYPE = "application/vnd.code.tree.explorerbookmarktree";

const extractUris = async (item: DataTransferItem): Promise<string[]> => {
	const value = item.value;
	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === "string");
	}

	try {
		const text = await item.asString();
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) {
			return parsed.filter(
				(entry): entry is string => typeof entry === "string"
			);
		}

		if (typeof parsed === "string") {
			return parsed
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean);
		}
	} catch {
		// Ignore malformed data.
	}

	return [];
};

export class BookmarkTreeDragAndDropController
	implements TreeDragAndDropController<BookmarkTreeNode>, Disposable
{
	readonly dropMimeTypes = [TREE_MIME_TYPE] as const;
	readonly dragMimeTypes = [TREE_MIME_TYPE] as const;

	private readonly store: BookmarkStore;
	private readonly getMode: () => BookmarkViewMode;

	constructor(store: BookmarkStore, getMode: () => BookmarkViewMode) {
		this.store = store;
		this.getMode = getMode;
	}

	handleDrag = (
		source: readonly BookmarkTreeNode[],
		dataTransfer: DataTransfer,
		_token: CancellationToken
	) => {
		if (this.getMode() !== "list") {
			return;
		}

		const uris = source
			.filter(
				(node): node is BookmarkTreeItem => node instanceof BookmarkTreeItem
			)
			.map((item) => item.bookmark.uri);

		if (uris.length === 0) {
			return;
		}

		dataTransfer.set(
			TREE_MIME_TYPE,
			new DataTransferItem(Array.from(new Set(uris)))
		);
	};

	handleDrop = async (
		target: BookmarkTreeNode | undefined,
		dataTransfer: DataTransfer,
		_token: CancellationToken
	) => {
		if (this.getMode() !== "list") {
			return;
		}

		const item = dataTransfer.get(TREE_MIME_TYPE);
		if (!item) {
			return;
		}

		const uris = await extractUris(item);
		if (uris.length === 0) {
			return;
		}

		const targetUri =
			target instanceof BookmarkTreeItem ? target.bookmark.uri : undefined;
		await this.store.reorder(uris, targetUri);
	};

	dispose = () => {
		// No state to dispose; included to satisfy Disposable contract.
	};
}

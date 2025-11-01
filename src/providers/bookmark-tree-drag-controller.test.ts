/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
import { describe, expect, it, vi } from "vitest";
import { DataTransfer, DataTransferItem } from "vscode";
import type { CancellationToken } from "vscode";
import type { BookmarkStore } from "../bookmarks/bookmark-store";
import type { BookmarkEntry } from "../bookmarks/bookmark-store";
import { BookmarkTreeItem } from "./bookmark-tree-data-provider";
import { BookmarkTreeDragAndDropController } from "./bookmark-tree-drag-controller";

const createStore = () => {
	const reorder = vi.fn<
		(
			sourceUris: readonly string[],
			targetUri: string | undefined
		) => Promise<void>
	>(async () => undefined);

	const store: BookmarkStore = {
		getAll: () => [],
		add: async () => undefined,
		reorder,
		remove: async () => undefined,
		clear: async () => undefined,
		onDidChange: () => ({ dispose: () => undefined }),
		dispose: () => undefined,
	};

	return { store, reorder };
};

const TREE_MIME_TYPE = "application/vnd.code.tree.explorerbookmarktree";

const createItem = (label: string, uri: string) => {
	const entry: BookmarkEntry = { label, uri, type: "file" };
	return new BookmarkTreeItem(entry, "explorerBookmarkTree.openBookmark");
};

const cancellationToken = {
	isCancellationRequested: false,
	onCancellationRequested: () => ({ dispose: () => undefined }),
} as unknown as CancellationToken;

describe("BookmarkTreeDragAndDropController", () => {
	it("adds dragged bookmark URIs to the data transfer in list mode", () => {
		const { store } = createStore();
		const controller = new BookmarkTreeDragAndDropController(
			store,
			() => "list"
		);
		const first = createItem("first", "file:///repo/first.txt");
		const second = createItem("second", "file:///repo/second.txt");
		const transfer = new DataTransfer();

		controller.handleDrag([first, second], transfer, cancellationToken);

		const payload = transfer.get(TREE_MIME_TYPE);
		expect(payload?.value).toEqual([first.bookmark.uri, second.bookmark.uri]);
	});

	it("ignores drag operations when not in list mode", () => {
		const { store } = createStore();
		const controller = new BookmarkTreeDragAndDropController(
			store,
			() => "tree"
		);
		const item = createItem("only", "file:///repo/only.txt");
		const transfer = new DataTransfer();

		controller.handleDrag([item], transfer, cancellationToken);

		expect(transfer.get(TREE_MIME_TYPE)).toBeUndefined();
	});

	it("reorders bookmarks when dropped on a target", async () => {
		const { store, reorder } = createStore();
		const controller = new BookmarkTreeDragAndDropController(
			store,
			() => "list"
		);
		const dragged = createItem("first", "file:///repo/first.txt");
		const target = createItem("second", "file:///repo/second.txt");
		const transfer = new DataTransfer();
		transfer.set(TREE_MIME_TYPE, new DataTransferItem([dragged.bookmark.uri]));

		await controller.handleDrop(target, transfer, cancellationToken);

		expect(reorder).toHaveBeenCalledWith(
			[dragged.bookmark.uri],
			target.bookmark.uri
		);
	});

	it("appends bookmarks when dropped on the root target", async () => {
		const { store, reorder } = createStore();
		const controller = new BookmarkTreeDragAndDropController(
			store,
			() => "list"
		);
		const dragged = createItem("first", "file:///repo/first.txt");
		const transfer = new DataTransfer();
		transfer.set(TREE_MIME_TYPE, new DataTransferItem([dragged.bookmark.uri]));

		await controller.handleDrop(undefined, transfer, cancellationToken);

		expect(reorder).toHaveBeenCalledWith([dragged.bookmark.uri], undefined);
	});

	it("ignores drops when not in list mode", async () => {
		const { store, reorder } = createStore();
		const controller = new BookmarkTreeDragAndDropController(
			store,
			() => "tree"
		);
		const dragged = createItem("first", "file:///repo/first.txt");
		const transfer = new DataTransfer();
		transfer.set(TREE_MIME_TYPE, new DataTransferItem([dragged.bookmark.uri]));

		await controller.handleDrop(undefined, transfer, cancellationToken);

		expect(reorder).not.toHaveBeenCalled();
	});
});

import { EventEmitter, Uri } from "vscode";
import type { Disposable, ExtensionContext } from "vscode";
import { BOOKMARK_NAMESPACE } from "../constants";

export interface BookmarkEntry {
	readonly uri: string;
	readonly label: string;
	readonly type: "file" | "folder";
}

export interface BookmarkStore {
	readonly getAll: () => BookmarkEntry[];
	readonly add: (entry: BookmarkEntry) => Promise<void>;
	readonly onDidChange: (
		listener: (items: BookmarkEntry[]) => void
	) => Disposable;
	readonly dispose: () => void;
}

const STORAGE_KEY = `${BOOKMARK_NAMESPACE}.bookmarks`;

const isBookmarkEntry = (value: unknown): value is BookmarkEntry => {
	if (value === null || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<BookmarkEntry>;
	if (typeof candidate.uri !== "string" || candidate.uri.length === 0) {
		return false;
	}

	if (typeof candidate.label !== "string" || candidate.label.length === 0) {
		return false;
	}

	return candidate.type === "file" || candidate.type === "folder";
};

const sanitizeEntries = (value: unknown): BookmarkEntry[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	const result: BookmarkEntry[] = [];

	for (const item of value) {
		if (isBookmarkEntry(item)) {
			try {
				Uri.parse(item.uri);
				result.push({ ...item });
			} catch {
				// Skip entries with invalid URIs.
			}
		}
	}

	return result;
};

export const createBookmarkStore = (
	context: ExtensionContext
): BookmarkStore => {
	const storage = context.globalState;
	let entries = sanitizeEntries(storage.get(STORAGE_KEY));

	const emitter = new EventEmitter<BookmarkEntry[]>();

	const add = async (entry: BookmarkEntry) => {
		const existing = entries.find((item) => item.uri === entry.uri);
		if (existing) {
			return;
		}

		entries = [...entries, entry];
		await storage.update(STORAGE_KEY, entries);
		emitter.fire([...entries]);
	};

	const getAll = () => [...entries];

	const onDidChange = (listener: (items: BookmarkEntry[]) => void) =>
		emitter.event(listener);

	const dispose = () => emitter.dispose();

	return { add, getAll, onDidChange, dispose };
};

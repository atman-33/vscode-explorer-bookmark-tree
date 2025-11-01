import { EventEmitter, type ExtensionContext, type Event } from "vscode";
import { BOOKMARK_NAMESPACE } from "../constants";

export type BookmarkViewMode = "list" | "tree";

export interface BookmarkViewModeStore {
	getMode: () => BookmarkViewMode;
	setMode: (mode: BookmarkViewMode) => Thenable<void>;
	onDidChange: Event<BookmarkViewMode>;
	dispose: () => void;
}

const STORAGE_KEY = `${BOOKMARK_NAMESPACE}:viewMode`;

const sanitize = (value: unknown): BookmarkViewMode => {
	if (value === "tree") {
		return "tree";
	}

	return "list";
};

export const createBookmarkViewModeStore = (
	context: ExtensionContext
): BookmarkViewModeStore => {
	const storage = context.globalState;
	let current = sanitize(storage.get(STORAGE_KEY));
	const emitter = new EventEmitter<BookmarkViewMode>();

	const getMode = () => current;

	const setMode = async (mode: BookmarkViewMode) => {
		if (mode === current) {
			return;
		}

		current = mode;
		await storage.update(STORAGE_KEY, current);
		emitter.fire(current);
	};

	const onDidChange = emitter.event;

	const dispose = () => {
		emitter.dispose();
	};

	return { getMode, setMode, onDidChange, dispose };
};

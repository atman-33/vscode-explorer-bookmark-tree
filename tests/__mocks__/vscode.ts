/** biome-ignore-all lint/nursery/noUselessUndefined: ignore */
const createDisposable = () => ({ dispose: () => undefined });

export type Disposable = ReturnType<typeof createDisposable>;

export class EventEmitter<T> {
	private listeners: Array<(value: T) => void> = [];

	event = (listener: (value: T) => void) => {
		this.listeners.push(listener);
		return {
			dispose: () => {
				this.listeners = this.listeners.filter((item) => item !== listener);
			},
		};
	};

	fire = (value: T) => {
		for (const listener of this.listeners) {
			listener(value);
		}
	};

	dispose = () => {
		this.listeners = [];
	};
}

export class ThemeIcon {
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}

	static readonly Folder = new ThemeIcon("folder");
	static readonly File = new ThemeIcon("file");
}

export const TreeItemCollapsibleState = {
	None: 0,
} as const;

export type TreeItemCollapsibleStateValue =
	(typeof TreeItemCollapsibleState)[keyof typeof TreeItemCollapsibleState];

export class TreeItem {
	label: string;
	collapsibleState: TreeItemCollapsibleStateValue;
	contextValue?: string;
	tooltip?: string;
	iconPath?: ThemeIcon;
	resourceUri?: Uri;
	command?: { command: string; title: string; arguments?: unknown[] };

	constructor(label: string, collapsibleState: TreeItemCollapsibleStateValue) {
		this.label = label;
		this.collapsibleState = collapsibleState;
	}
}

export class Uri {
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}

	static parse(value: string) {
		if (value.length === 0) {
			throw new Error("Invalid URI");
		}

		return new Uri(value);
	}

	get fsPath() {
		return this.path;
	}

	toString() {
		return this.path;
	}

	toStringWithSkipEncoding() {
		return this.path;
	}

	toJSON() {
		return this.path;
	}
}

export const commands = {
	registerCommand: () => createDisposable(),
	executeCommand: async () => undefined,
};

export const window = {
	registerTreeDataProvider: () => createDisposable(),
	showInformationMessage: async () => undefined,
	showWarningMessage: async () => undefined,
};

export const workspace = {
	fs: {
		stat: async () => ({ type: 0 }),
	},
};

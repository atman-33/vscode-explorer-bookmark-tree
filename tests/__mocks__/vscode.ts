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
	Collapsed: 1,
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

const URI_PARSE_REGEX = /^([a-z0-9+.-]+):(\/\/([^/?#]*))?([^?#]*)/i;

export class DataTransferItem {
	value: unknown;

	constructor(value: unknown) {
		this.value = value;
	}

	asString = () => {
		if (typeof this.value === "string") {
			return Promise.resolve(this.value);
		}

		return Promise.resolve(JSON.stringify(this.value));
	};

	asFile = () => undefined;
}

export class DataTransfer implements Iterable<[string, DataTransferItem]> {
	private readonly entries = new Map<string, DataTransferItem>();

	get = (mimeType: string) => this.entries.get(mimeType.toLowerCase());

	set = (mimeType: string, item: DataTransferItem) => {
		this.entries.set(mimeType.toLowerCase(), item);
	};

	forEach = (callback: (item: DataTransferItem, mimeType: string) => void) => {
		for (const [mime, item] of this.entries) {
			callback(item, mime);
		}
	};

	[Symbol.iterator]() {
		return this.entries[Symbol.iterator]();
	}
}

export const CancellationToken = {
	None: {
		isCancellationRequested: false,
		onCancellationRequested: () => createDisposable(),
	},
};

export class Uri {
	private readonly schemeValue: string;
	private readonly authorityValue: string;
	private readonly pathValue: string;

	private constructor(scheme: string, authority: string, path: string) {
		this.schemeValue = scheme;
		this.authorityValue = authority;
		this.pathValue = path || "/";
	}

	static parse(value: string) {
		if (!value) {
			throw new Error("Invalid URI");
		}

		const match = value.match(URI_PARSE_REGEX);
		if (!match) {
			throw new Error(`Unsupported URI: ${value}`);
		}

		const [, scheme, , authority = "", path = "/"] = match;
		return new Uri(scheme, authority, path || "/");
	}

	with(changes: { scheme?: string; authority?: string; path?: string }) {
		return new Uri(
			changes.scheme ?? this.schemeValue,
			changes.authority ?? this.authorityValue,
			changes.path ?? this.pathValue
		);
	}

	get scheme() {
		return this.schemeValue;
	}

	get authority() {
		return this.authorityValue;
	}

	get path() {
		return this.pathValue;
	}

	get fsPath() {
		return decodeURIComponent(this.pathValue);
	}

	toString() {
		const authority = this.authorityValue ? `//${this.authorityValue}` : "//";
		return `${this.schemeValue}:${authority}${this.pathValue}`;
	}

	toStringWithSkipEncoding() {
		return this.toString();
	}

	toJSON() {
		return this.toString();
	}
}

export const commands = {
	registerCommand: () => createDisposable(),
	executeCommand: async () => undefined,
};

export const window = {
	createTreeView: () => createDisposable(),
	registerTreeDataProvider: () => createDisposable(),
	showInformationMessage: async () => undefined,
	showWarningMessage: async () => undefined,
};

export const workspace = {
	fs: {
		stat: async () => ({ type: 0 }),
	},
};

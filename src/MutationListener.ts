type MutationRecordCallback = (event: MutationRecord) => void;
type MutationNodeCallback = (node: Node) => void;
type MutationEventCallback = MutationRecordCallback | MutationNodeCallback;

export class MutationListener {
    private readonly observer: MutationObserver;

    private readonly recordListeners: Map<
        string,
        Array<MutationRecordCallback>
    >;
    private readonly nodeListeners: Map<string, Array<MutationNodeCallback>>;

    public constructor(target: Node, options?: MutationObserverInit) {
        this.recordListeners = new Map();
        this.nodeListeners = new Map();
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const { addedNodes, removedNodes, type } = mutation;
                for (const callback of this.recordListeners.get(type) ?? []) {
                    callback(mutation);
                }
                for (const node of addedNodes) {
                    for (const callback of this.nodeListeners.get("added") ??
                        []) {
                        callback(node);
                    }
                }
                for (const node of removedNodes) {
                    for (const callback of this.nodeListeners.get("removed") ??
                        []) {
                        callback(node);
                    }
                }
            }
        });

        this.observer.observe(target, options);
    }

    public stop() {
        this.observer.disconnect();
    }

    public on(event: "added", callback: MutationNodeCallback): this;
    public on(event: "removed", callback: MutationNodeCallback): this;
    public on(event: "attributes", callback: MutationRecordCallback): this;
    public on(event: "characterData", callback: MutationRecordCallback): this;
    public on(event: "childList", callback: MutationRecordCallback): this;
    public on(event: string, callback: MutationEventCallback) {
        switch (event) {
            case "added":
            case "removed":
                this.nodeListeners
                    .getOrInsert(event, new Array())
                    .push(callback as MutationNodeCallback);
                break;
            case "attributes":
            case "characterData":
            case "childList":
                this.recordListeners
                    .getOrInsert(event, new Array())
                    .push(callback as MutationRecordCallback);
                break;
        }
        return this;
    }

    public off(event: string, callback: MutationEventCallback) {
        const recordCallbacks = this.recordListeners.get(event);
        if (recordCallbacks) {
            recordCallbacks.splice(
                recordCallbacks.indexOf(callback as MutationRecordCallback),
                1,
            );
        }
        const nodeCallbacks = this.nodeListeners.get(event);
        if (nodeCallbacks) {
            nodeCallbacks.splice(
                nodeCallbacks.indexOf(callback as MutationNodeCallback),
                1,
            );
        }
        return this;
    }

    [Symbol.dispose]() {
        this.destroy();
    }

    public destroy() {
        this.stop();
        this.recordListeners.clear();
        this.nodeListeners.clear();
    }
}

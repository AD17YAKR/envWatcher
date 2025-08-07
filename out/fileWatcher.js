"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
const vscode = require("vscode");
class FileWatcher {
    constructor(context, onFileChange) {
        this.context = context;
        this.onFileChange = onFileChange;
    }
    start(pattern) {
        if (!vscode.workspace.workspaceFolders)
            return;
        const watchPattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], pattern);
        this.watcher = vscode.workspace.createFileSystemWatcher(watchPattern);
        this.watcher.onDidChange(() => this.handleChange());
        this.watcher.onDidCreate(() => this.handleChange());
        this.context.subscriptions.push(this.watcher);
    }
    handleChange() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.onFileChange();
        }, 500);
    }
    dispose() {
        if (this.watcher) {
            this.watcher.dispose();
            this.watcher = undefined;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=fileWatcher.js.map
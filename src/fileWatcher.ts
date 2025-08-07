import * as vscode from "vscode";

export class FileWatcher {
  private watcher: vscode.FileSystemWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | undefined;

  constructor(
    private context: vscode.ExtensionContext,
    private onFileChange: () => void
  ) {}

  start(pattern: string) {
    if (!vscode.workspace.workspaceFolders) return;

    const watchPattern = new vscode.RelativePattern(
      vscode.workspace.workspaceFolders[0],
      pattern
    );

    this.watcher = vscode.workspace.createFileSystemWatcher(watchPattern);
    this.watcher.onDidChange(() => this.handleChange());
    this.watcher.onDidCreate(() => this.handleChange());

    this.context.subscriptions.push(this.watcher);
  }

  private handleChange() {
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
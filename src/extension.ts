import * as vscode from "vscode";
import * as path from "path";

class EnvWatcher {
  private watcher: vscode.FileSystemWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | undefined;
  private terminal: vscode.Terminal | undefined;
  private enabled: boolean = true;
  private serverTerminal: vscode.Terminal | undefined;
  private isServerRunning: boolean = false;

  constructor(private context: vscode.ExtensionContext) {
    this.loadConfig();
    this.startWatching();
    this.monitorTerminals();

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration("envWatcher")) {
          this.dispose();
          this.loadConfig();
          this.startWatching();
        }
      },
      null,
      context.subscriptions
    );
  }

  private monitorTerminals() {
    vscode.window.onDidCloseTerminal(
      (terminal) => {
        if (terminal === this.serverTerminal) {
          this.isServerRunning = false;
          this.serverTerminal = undefined;
        }
      },
      null,
      this.context.subscriptions
    );

    // Assume server might be running if terminals exist
    this.isServerRunning = vscode.window.terminals.length > 0;
  }

  private loadConfig() {
    const config = vscode.workspace.getConfiguration("envWatcher");
    this.enabled = config.get("enabled", true);
  }

  private startWatching() {
    if (!this.enabled || !vscode.workspace.workspaceFolders) return;

    const config = vscode.workspace.getConfiguration("envWatcher");
    const watchFile = config.get("watchFile", ".env");

    const pattern = new vscode.RelativePattern(
      vscode.workspace.workspaceFolders[0],
      watchFile
    );

    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.watcher.onDidChange(() => this.handleFileChange());
    this.watcher.onDidCreate(() => this.handleFileChange());

    this.context.subscriptions.push(this.watcher);
  }

  private handleFileChange() {
    if (!this.enabled) return;

    const config = vscode.workspace.getConfiguration("envWatcher");
    const debounceTime = config.get("debounceTime", 500);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.restartServer();
    }, debounceTime);
  }

  private async restartServer() {
    if (!this.isServerRunning) return;

    const config = vscode.workspace.getConfiguration("envWatcher");
    const restartCommand = config.get("restartCommand", "npm run dev");

    if (!(await this.shouldRestart(config))) return;

    await this.executeRestart(restartCommand);
    vscode.window.showInformationMessage("Development server restarted");
  }

  private async shouldRestart(
    config: vscode.WorkspaceConfiguration
  ): Promise<boolean> {
    const autoRestart = config.get("autoRestart", true);
    if (autoRestart) return true;

    const choice = await vscode.window.showInformationMessage(
      "Environment file changed. Restart development server?",
      "Yes",
      "No"
    );
    return choice === "Yes";
  }

  private async executeRestart(restartCommand: string) {
    const terminal = this.getOrCreateTerminal();

    terminal.sendText("\u0003"); // Stop current process
    await new Promise((resolve) => setTimeout(resolve, 200));
    terminal.sendText(restartCommand);
    terminal.show();

    this.isServerRunning = true;
  }

  private getOrCreateTerminal(): vscode.Terminal {
    // Use tracked terminal if still active
    if (this.serverTerminal && !this.serverTerminal.exitStatus) {
      return this.serverTerminal;
    }

    // Use active terminal if available
    const activeTerminal = vscode.window.activeTerminal;
    if (activeTerminal && !activeTerminal.exitStatus) {
      this.serverTerminal = activeTerminal;
      return activeTerminal;
    }

    // Create new terminal
    this.serverTerminal = vscode.window.createTerminal("EnvWatcher Server");
    return this.serverTerminal;
  }

  public enable() {
    this.enabled = true;
    const config = vscode.workspace.getConfiguration("envWatcher");
    config.update("enabled", true, vscode.ConfigurationTarget.Workspace);
    this.dispose();
    this.startWatching();
    vscode.window.showInformationMessage("Env Watcher enabled");
  }

  public disable() {
    this.enabled = false;
    const config = vscode.workspace.getConfiguration("envWatcher");
    config.update("enabled", false, vscode.ConfigurationTarget.Workspace);
    this.dispose();
    vscode.window.showInformationMessage("Env Watcher disabled");
  }

  public async manualRestart() {
    this.trackActiveTerminal();
    await this.restartServer();
  }

  private trackActiveTerminal() {
    if (vscode.window.activeTerminal) {
      this.serverTerminal = vscode.window.activeTerminal;
      this.isServerRunning = true;
    }
  }

  public dispose() {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Env Watcher extension activated");
  const envWatcher = new EnvWatcher(context);

  const enableCommand = vscode.commands.registerCommand(
    "env-watcher.enable",
    () => envWatcher.enable()
  );

  const disableCommand = vscode.commands.registerCommand(
    "env-watcher.disable",
    () => envWatcher.disable()
  );

  const restartCommand = vscode.commands.registerCommand(
    "env-watcher.restart",
    () => envWatcher.manualRestart()
  );

  context.subscriptions.push(
    enableCommand,
    disableCommand,
    restartCommand,
    envWatcher
  );
}

export function deactivate() {}

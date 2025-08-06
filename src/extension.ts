import * as vscode from "vscode";
import * as path from "path";

class EnvWatcher {
  private watcher: vscode.FileSystemWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | undefined;
  private terminal: vscode.Terminal | undefined;
  private enabled: boolean = true;

  constructor(private context: vscode.ExtensionContext) {
    this.loadConfig();
    this.startWatching();
    
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('envWatcher')) {
        this.dispose();
        this.loadConfig();
        this.startWatching();
      }
    }, null, context.subscriptions);
    

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
    const config = vscode.workspace.getConfiguration("envWatcher");
    const autoRestart = config.get("autoRestart", true);
    const restartCommand = config.get("restartCommand", "npm run dev");

    if (!autoRestart) {
      const choice = await vscode.window.showInformationMessage(
        "Environment file changed. Restart development server?",
        "Yes",
        "No"
      );
      if (choice !== "Yes") return;
    }

    // Find and dispose existing terminal
    const existingTerminal = vscode.window.terminals.find(
      (t) => t.name === "EnvWatcher Server"
    );

    if (existingTerminal) {
      // Send Ctrl+C to terminate any running process
      existingTerminal.sendText("\u0003");
      await new Promise((resolve) => setTimeout(resolve, 100));
      existingTerminal.dispose();
    }

    // Create new terminal and run command
    this.terminal = vscode.window.createTerminal("EnvWatcher Server");
    this.terminal.sendText(restartCommand);
    this.terminal.show();

    vscode.window.showInformationMessage("Development server restarted");
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

  public manualRestart() {
    this.restartServer();
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

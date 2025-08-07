import * as vscode from "vscode";
import { FileWatcher } from "./fileWatcher";
import { TerminalManager } from "./terminalManager";
import { NotificationManager } from "./notificationManager";

class EnvWatcher {
  private configWatcher: FileWatcher;
  private envWatcher: FileWatcher;
  private terminalManager: TerminalManager;
  private notificationManager: NotificationManager;
  private enabled: boolean = true;

  constructor(private context: vscode.ExtensionContext) {
    this.terminalManager = new TerminalManager(context);
    this.notificationManager = new NotificationManager();
    
    this.configWatcher = new FileWatcher(context, () => this.handleConfigChange());
    this.envWatcher = new FileWatcher(context, () => this.handleEnvChange());
    
    this.loadConfig();
    this.startWatching();
    this.startEnvWatching();

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



  private loadConfig() {
    const config = vscode.workspace.getConfiguration("envWatcher");
    this.enabled = config.get("enabled", true);
  }

  private startWatching() {
    if (!this.enabled) return;
    
    const config = vscode.workspace.getConfiguration("envWatcher");
    const watchFile = config.get("watchFile", ".env");
    
    this.configWatcher.start(watchFile);
  }

  private startEnvWatching() {
    this.envWatcher.start("*.env*");
  }

  private handleConfigChange() {
    if (!this.enabled) return;
    this.restartServer();
  }

  private handleEnvChange() {
    if (this.enabled) {
      this.notificationManager.showEnvChangeReminder(() => {
        this.terminalManager.trackActiveTerminal();
        this.restartServer();
      });
    } else {
      this.notificationManager.showLightweightReminder();
    }
  }

  private async restartServer() {
    if (!this.terminalManager.serverRunning) return;

    const config = vscode.workspace.getConfiguration("envWatcher");
    const restartCommand = config.get("restartCommand", "npm run dev");

    if (!(await this.notificationManager.shouldRestart(config))) return;

    await this.terminalManager.executeRestart(restartCommand);
    this.notificationManager.showRestartSuccess();
  }

  public enable() {
    this.enabled = true;
    const config = vscode.workspace.getConfiguration("envWatcher");
    config.update("enabled", true, vscode.ConfigurationTarget.Workspace);
    this.dispose();
    this.startWatching();
    this.notificationManager.showEnabled();
  }

  public disable() {
    this.enabled = false;
    const config = vscode.workspace.getConfiguration("envWatcher");
    config.update("enabled", false, vscode.ConfigurationTarget.Workspace);
    this.dispose();
    this.notificationManager.showDisabled();
  }

  public async manualRestart() {
    this.terminalManager.trackActiveTerminal();
    await this.restartServer();
  }

  public dispose() {
    this.configWatcher.dispose();
    this.envWatcher.dispose();
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

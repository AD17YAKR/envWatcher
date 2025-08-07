import * as vscode from "vscode";

export class TerminalManager {
  private serverTerminal: vscode.Terminal | undefined;
  private isServerRunning: boolean = false;

  constructor(private context: vscode.ExtensionContext) {
    this.monitorTerminals();
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

    this.isServerRunning = vscode.window.terminals.length > 0;
  }

  async executeRestart(restartCommand: string) {
    const terminal = this.getOrCreateTerminal();

    terminal.sendText("\u0003");
    await new Promise((resolve) => setTimeout(resolve, 200));
    terminal.sendText(restartCommand);
    terminal.show();

    this.isServerRunning = true;
  }

  private getOrCreateTerminal(): vscode.Terminal {
    if (this.serverTerminal && !this.serverTerminal.exitStatus) {
      return this.serverTerminal;
    }

    const activeTerminal = vscode.window.activeTerminal;
    if (activeTerminal && !activeTerminal.exitStatus) {
      this.serverTerminal = activeTerminal;
      return activeTerminal;
    }

    this.serverTerminal = vscode.window.createTerminal("EnvWatcher Server");
    return this.serverTerminal;
  }

  trackActiveTerminal() {
    if (vscode.window.activeTerminal) {
      this.serverTerminal = vscode.window.activeTerminal;
      this.isServerRunning = true;
    }
  }

  get serverRunning(): boolean {
    return this.isServerRunning;
  }
}
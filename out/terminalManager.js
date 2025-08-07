"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalManager = void 0;
const vscode = require("vscode");
class TerminalManager {
    constructor(context) {
        this.context = context;
        this.isServerRunning = false;
        this.monitorTerminals();
    }
    monitorTerminals() {
        vscode.window.onDidCloseTerminal((terminal) => {
            if (terminal === this.serverTerminal) {
                this.isServerRunning = false;
                this.serverTerminal = undefined;
            }
        }, null, this.context.subscriptions);
        this.isServerRunning = vscode.window.terminals.length > 0;
    }
    async executeRestart(restartCommand) {
        const terminal = this.getOrCreateTerminal();
        terminal.sendText("\u0003");
        await new Promise((resolve) => setTimeout(resolve, 200));
        terminal.sendText(restartCommand);
        terminal.show();
        this.isServerRunning = true;
    }
    getOrCreateTerminal() {
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
    get serverRunning() {
        return this.isServerRunning;
    }
}
exports.TerminalManager = TerminalManager;
//# sourceMappingURL=terminalManager.js.map
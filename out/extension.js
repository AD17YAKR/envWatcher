"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fileWatcher_1 = require("./fileWatcher");
const terminalManager_1 = require("./terminalManager");
const notificationManager_1 = require("./notificationManager");
class EnvWatcher {
    constructor(context) {
        this.context = context;
        this.enabled = true;
        this.terminalManager = new terminalManager_1.TerminalManager(context);
        this.notificationManager = new notificationManager_1.NotificationManager();
        this.configWatcher = new fileWatcher_1.FileWatcher(context, () => this.handleConfigChange());
        this.envWatcher = new fileWatcher_1.FileWatcher(context, () => this.handleEnvChange());
        this.loadConfig();
        this.startWatching();
        this.startEnvWatching();
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("envWatcher")) {
                this.dispose();
                this.loadConfig();
                this.startWatching();
            }
        }, null, context.subscriptions);
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration("envWatcher");
        this.enabled = config.get("enabled", true);
    }
    startWatching() {
        if (!this.enabled)
            return;
        const config = vscode.workspace.getConfiguration("envWatcher");
        const watchFile = config.get("watchFile", ".env");
        this.configWatcher.start(watchFile);
    }
    startEnvWatching() {
        this.envWatcher.start("*.env*");
    }
    handleConfigChange() {
        if (!this.enabled)
            return;
        this.restartServer();
    }
    handleEnvChange() {
        if (this.enabled) {
            this.notificationManager.showEnvChangeReminder(() => {
                this.terminalManager.trackActiveTerminal();
                this.restartServer();
            });
        }
        else {
            this.notificationManager.showLightweightReminder();
        }
    }
    async restartServer() {
        if (!this.terminalManager.serverRunning)
            return;
        const config = vscode.workspace.getConfiguration("envWatcher");
        const restartCommand = config.get("restartCommand", "npm run dev");
        if (!(await this.notificationManager.shouldRestart(config)))
            return;
        await this.terminalManager.executeRestart(restartCommand);
        this.notificationManager.showRestartSuccess();
    }
    enable() {
        this.enabled = true;
        const config = vscode.workspace.getConfiguration("envWatcher");
        config.update("enabled", true, vscode.ConfigurationTarget.Workspace);
        this.dispose();
        this.startWatching();
        this.notificationManager.showEnabled();
    }
    disable() {
        this.enabled = false;
        const config = vscode.workspace.getConfiguration("envWatcher");
        config.update("enabled", false, vscode.ConfigurationTarget.Workspace);
        this.dispose();
        this.notificationManager.showDisabled();
    }
    async manualRestart() {
        this.terminalManager.trackActiveTerminal();
        await this.restartServer();
    }
    dispose() {
        this.configWatcher.dispose();
        this.envWatcher.dispose();
    }
}
function activate(context) {
    console.log("Env Watcher extension activated");
    const envWatcher = new EnvWatcher(context);
    const enableCommand = vscode.commands.registerCommand("env-watcher.enable", () => envWatcher.enable());
    const disableCommand = vscode.commands.registerCommand("env-watcher.disable", () => envWatcher.disable());
    const restartCommand = vscode.commands.registerCommand("env-watcher.restart", () => envWatcher.manualRestart());
    context.subscriptions.push(enableCommand, disableCommand, restartCommand, envWatcher);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
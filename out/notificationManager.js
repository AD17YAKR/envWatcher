"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
const vscode = require("vscode");
class NotificationManager {
    async shouldRestart(config) {
        const autoRestart = config.get("autoRestart", true);
        if (autoRestart)
            return true;
        const choice = await vscode.window.showInformationMessage("Configuration file changed. Restart development server?", "Restart Now", "Remind Later", "Ignore");
        if (choice === "Restart Now") {
            return true;
        }
        else if (choice === "Remind Later") {
            this.scheduleReminder();
        }
        return false;
    }
    scheduleReminder() {
        setTimeout(() => {
            vscode.window.showWarningMessage("⚠️ Env Watcher: Server restart still pending. Configuration changes may not be active.", "Restart Now", "Dismiss").then(choice => {
                if (choice === "Restart Now") {
                    vscode.commands.executeCommand("env-watcher.restart");
                }
            });
        }, 30000);
    }
    showEnvChangeReminder(onRestart) {
        const notification = vscode.window.showWarningMessage("Environment file changed. Consider restarting your development server.", "Restart Now", "Dismiss");
        notification.then(choice => {
            if (choice === "Restart Now") {
                onRestart();
            }
        });
        setTimeout(() => {
            // Auto-dismiss after 30 seconds
        }, 30000);
    }
    showRestartSuccess() {
        vscode.window.showInformationMessage("Env Watcher: Development server restarted");
    }
    showEnabled() {
        vscode.window.showInformationMessage("Env Watcher enabled");
    }
    showDisabled() {
        vscode.window.showInformationMessage("Env Watcher disabled");
    }
    showLightweightReminder() {
        const notification = vscode.window.showInformationMessage("💡 Environment file changed. Consider restarting your server.");
        // Auto-dismiss after 20 seconds
        setTimeout(() => {
            // Notification auto-dismisses
        }, 20000);
    }
}
exports.NotificationManager = NotificationManager;
//# sourceMappingURL=notificationManager.js.map
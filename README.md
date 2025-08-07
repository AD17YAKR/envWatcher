# Env Watcher

A smart VS Code extension that automatically restarts your development server when configuration files change. Perfect for any development environment where config changes require server restarts.

## ✨ Key Features

- 🔍 **Universal File Watching** - Watch any configuration file (`.env`, `config.py`, `settings.json`, etc.)
- 🧠 **Smart Server Detection** - Only restarts when a server is actually running
- 🔄 **Terminal Reuse** - Restarts in the same terminal where your server is running
- ⚡ **Lightning Fast** - Lightweight file watching with configurable debouncing
- 🎯 **Zero Duplicates** - Prevents multiple server instances from running
- 💡 **Always-On .env Reminders** - Gentle notifications for .env changes even when disabled

## 🚀 Perfect For

- **Node.js** projects with `.env`, `config.json` files
- **Python** applications with `config.py`, `settings.py` files
- **Any framework** that requires server restart on config changes
- **Multiple file types** - works with any file extension you specify

## 📦 Installation

Install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=DebugSoul.env-watcher)

## 🔧 Configuration

Add these settings to your workspace `.vscode/settings.json`:

```json
{
  "envWatcher.enabled": true,
  "envWatcher.watchFile": ".env",
  "envWatcher.restartCommand": "npm run dev",
  "envWatcher.autoRestart": true,
  "envWatcher.debounceTime": 500
}
```

### Configuration Examples

**Node.js with environment files:**

```json
{
  "envWatcher.watchFile": ".env*",
  "envWatcher.restartCommand": "npm run dev"
}
```

**Python Flask/Django:**

```json
{
  "envWatcher.watchFile": "config.py",
  "envWatcher.restartCommand": "python app.py"
}
```

**Multiple config files:**

```json
{
  "envWatcher.watchFile": "{.env,config.json,settings.py}",
  "envWatcher.restartCommand": "yarn dev"
}
```

## 🎮 Commands

- `Env Watcher: Enable` - Start watching configuration files
- `Env Watcher: Disable` - Stop watching files
- `Env Watcher: Restart Server` - Manually restart your development server

## 🔥 How It Works

1. **Detects Changes** - Monitors your specified config files for modifications
2. **Checks Server Status** - Only acts if a development server is actually running
3. **Smart Restart** - Stops the current process and restarts in the same terminal
4. **No Duplicates** - Prevents multiple server instances from running simultaneously
5. **Safety Net** - Always shows lightweight reminders for .env changes, even when disabled

## ⚙️ Settings Reference

| Setting                     | Type    | Default         | Description                                    |
| --------------------------- | ------- | --------------- | ---------------------------------------------- |
| `envWatcher.enabled`        | boolean | `true`          | Enable/disable file watching                   |
| `envWatcher.watchFile`      | string  | `".env"`        | File pattern to watch (supports glob patterns) |
| `envWatcher.restartCommand` | string  | `"npm run dev"` | Command to restart your server                 |
| `envWatcher.autoRestart`    | boolean | `true`          | Restart automatically without confirmation     |
| `envWatcher.debounceTime`   | number  | `500`           | Delay in milliseconds to prevent restart spam  |

## 🔧 Requirements

- VS Code 1.74.0 or higher
- Any development environment (Node.js, Python, etc.)

## 📝 Release Notes

### 0.1.1

- ✅ **Modular Architecture** - Cleaner, more maintainable codebase
- ✅ **Always-On .env Reminders** - Lightweight notifications even when extension is disabled
- ✅ **Enhanced User Experience** - Better notification system with reminder scheduling
- ✅ **Improved Reliability** - Better error handling and state management

### 0.0.3

- ✅ Smart server detection - only restarts when server is running
- ✅ Terminal reuse - restarts in existing terminal
- ✅ Universal file support - works with any configuration file
- ✅ Duplicate prevention - no more multiple server instances
- ✅ Improved reliability and performance

## 🤝 Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/AD17YAKR/envWatcher/issues) on GitHub.

## 📄 License

MIT - see [LICENSE.md](LICENSE.md) for details

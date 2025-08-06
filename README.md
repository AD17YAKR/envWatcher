# Env Watcher

A VS Code extension that automatically restarts your development server when `.env` files change.

## Features

- 🔍 Watches for changes in `.env` files in your workspace
- 🔄 Automatically restarts development servers when environment variables change
- ⚡ Lightweight and fast file watching
- 🎯 Configurable file patterns and restart commands

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from VSIX file

## Usage

1. Open a workspace containing `.env` files
2. The extension automatically starts watching for changes
3. When a `.env` file is modified, configured commands will restart automatically

## Configuration

Add these settings to your VS Code settings:

```json
{
  "envWatcher.watchPatterns": [".env", ".env.*"],
  "envWatcher.restartCommand": "npm run dev",
  "envWatcher.enabled": true
}
```

## Commands

- `Env Watcher: Enable` - Enable environment file watching
- `Env Watcher: Disable` - Disable environment file watching
- `Env Watcher: Restart Server` - Manually restart the development server

## Requirements

- VS Code 1.74.0 or higher
- Node.js development environment

## Release Notes

### 0.0.1

- Initial release
- Basic .env file watching functionality
- Configurable restart commands

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
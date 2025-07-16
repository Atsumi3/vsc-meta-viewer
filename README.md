# Meta Viewer

A Visual Studio Code extension that displays file metadata in a clean, table-formatted view.

## Features

- 📊 Display file metadata in an organized table format
- 📁 Basic file information: name, path, size, type, creation/modification dates
- 🔍 Git integration: shows last author and commit hash
- 📱 iOS development file support: provisioning profiles with expiration dates and team IDs
- 🖼️ Media file details: format, dimensions, MIME types
- ⚙️ Configurable binary data preview option

## Usage

1. Right-click on any file in the Explorer
2. Select "Show File Metadata" from the context menu
3. View the metadata in a new panel

Alternatively, you can use the Command Palette:
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Show File Metadata"
- Press Enter

## Supported File Types

### General Files
- All standard file types with basic metadata

### Development Files
- iOS Provisioning Profiles (`.mobileprovision`): Shows expiration date, team ID, and profile name
- Various programming languages with appropriate file type detection

### Media Files
- Images (`.jpg`, `.png`, `.gif`, etc.): Format, dimensions, camera info (if available)
- Videos (`.mp4`, `.mov`, `.avi`, etc.): Format and MIME type
- Audio (`.mp3`, `.wav`, `.flac`, etc.): Format and MIME type

## Configuration

You can configure the extension through VS Code settings:

- `meta-viewer.showBinaryData`: Enable/disable binary data preview (default: false)

## Requirements

- Visual Studio Code 1.74.0 or higher
- Git (optional, for Git metadata features)

## Installation

### From Visual Studio Code Marketplace (Coming Soon)

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X or Ctrl+Shift+X)
3. Search for "Meta Viewer"
4. Click Install

### From VSIX Package (Local Installation)

1. Download or build the `.vsix` file
2. Install using one of these methods:
   - **Command line**: `code --install-extension meta-viewer-0.0.1.vsix`
   - **VS Code UI**: 
     - Open Command Palette (Cmd+Shift+P or Ctrl+Shift+P)
     - Run "Extensions: Install from VSIX..."
     - Select the `.vsix` file

### Build from Source

```bash
# Clone the repository
git clone https://github.com/Atsumi3/vsc-meta-viewer.git
cd vsc-meta-viewer

# Install dependencies
npm install

# Build the extension
npm run compile

# Package the extension
npm install -g vsce
vsce package

# Install the generated VSIX
code --install-extension meta-viewer-0.0.1.vsix
```

## Development

```bash
# Clone the repository
git clone https://github.com/Atsumi3/vsc-meta-viewer.git
cd vsc-meta-viewer

# Install dependencies
npm install

# Compile
npm run compile

# Run in development mode
npm run watch

# Test the extension (F5 in VS Code)
# This opens a new VS Code window with the extension loaded
```

### Uninstalling

To uninstall the extension:
```bash
code --uninstall-extension Atsumi3.meta-viewer
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

### Workflows

1. **Build and Test** (`build.yml`)
   - Runs on push to main and pull requests
   - Tests on multiple OS (Ubuntu, Windows, macOS) and Node versions
   - Builds and packages the extension
   - Uploads VSIX artifacts

2. **Release** (`release.yml`)
   - Triggered by version tags (e.g., `v1.0.0`)
   - Creates GitHub releases with VSIX attachments
   - Optionally publishes to VS Code Marketplace

3. **Publish to Marketplace** (`publish.yml`)
   - Manual workflow for publishing to VS Code Marketplace
   - Updates version and creates release tag

### Setting up for Publishing

To enable automatic publishing to VS Code Marketplace:

1. Create a Personal Access Token at https://marketplace.visualstudio.com/manage
2. Add the token as `VSCE_PAT` in your repository secrets

## Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## License

This project is licensed under the ISC License.

import * as vscode from 'vscode';
import { FileMetadata } from './metadataProvider';

export class MetadataPanel {
    public static currentPanel: MetadataPanel | undefined;
    public static readonly viewType = 'metadataPanel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, metadata: FileMetadata) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (MetadataPanel.currentPanel) {
            MetadataPanel.currentPanel._panel.reveal(column);
            MetadataPanel.currentPanel._update(metadata);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            MetadataPanel.viewType,
            'File Metadata',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        MetadataPanel.currentPanel = new MetadataPanel(panel, extensionUri);
        MetadataPanel.currentPanel._update(metadata);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        MetadataPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update(metadata: FileMetadata) {
        this._panel.title = `Metadata: ${metadata.fileName}`;
        this._panel.webview.html = this._getHtmlForWebview(metadata);
    }

    private _getHtmlForWebview(metadata: FileMetadata) {
        const showBinaryData = vscode.workspace.getConfiguration('meta-viewer').get('showBinaryData', false);

        const basicRows = [
            { label: 'File Name', value: metadata.fileName },
            { label: 'File Path', value: metadata.filePath },
            { label: 'File Size', value: metadata.fileSizeFormatted },
            { label: 'File Type', value: metadata.fileType },
            { label: 'Extension', value: metadata.extension },
            { label: 'Created', value: metadata.createdAt.toLocaleString() },
            { label: 'Modified', value: metadata.modifiedAt.toLocaleString() },
        ];

        if (metadata.lastAuthor) {
            basicRows.push({ label: 'Last Author (Git)', value: metadata.lastAuthor });
        }
        if (metadata.lastCommitHash) {
            basicRows.push({ label: 'Last Commit (Git)', value: metadata.lastCommitHash });
        }

        let additionalRows: Array<{ label: string; value: string }> = [];
        if (metadata.additionalInfo) {
            for (const [key, value] of Object.entries(metadata.additionalInfo)) {
                if (value !== null && value !== undefined) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                    additionalRows.push({ label, value: String(value) });
                }
            }
        }

        const basicRowsHtml = basicRows.map(row => `
            <tr>
                <td class="label">${this._escapeHtml(row.label)}</td>
                <td class="value">${this._escapeHtml(row.value)}</td>
            </tr>
        `).join('');

        const additionalRowsHtml = additionalRows.length > 0 ? `
            <h3>Additional Information</h3>
            <table>
                ${additionalRows.map(row => `
                    <tr>
                        <td class="label">${this._escapeHtml(row.label)}</td>
                        <td class="value">${this._escapeHtml(row.value)}</td>
                    </tr>
                `).join('')}
            </table>
        ` : '';

        let binaryDataHtml = '';
        if (showBinaryData && metadata.fileSize > 0) {
            binaryDataHtml = `
                <h3>Binary Data Preview</h3>
                <div class="binary-preview">
                    <p>Binary data preview is enabled. File size: ${metadata.fileSizeFormatted}</p>
                    <p class="hint">To see actual binary data, use a hex editor.</p>
                </div>
            `;
        }

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File Metadata</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                        margin: 0;
                    }
                    h1, h3 {
                        color: var(--vscode-foreground);
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    tr {
                        border-bottom: 1px solid var(--vscode-widget-border);
                    }
                    td {
                        padding: 10px;
                        vertical-align: top;
                    }
                    td.label {
                        width: 200px;
                        font-weight: bold;
                        color: var(--vscode-descriptionForeground);
                    }
                    td.value {
                        color: var(--vscode-foreground);
                        word-break: break-all;
                    }
                    .binary-preview {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        padding: 15px;
                        border-radius: 4px;
                        margin-top: 10px;
                    }
                    .hint {
                        color: var(--vscode-descriptionForeground);
                        font-style: italic;
                        font-size: 0.9em;
                    }
                </style>
            </head>
            <body>
                <h1>File Metadata</h1>
                <table>
                    ${basicRowsHtml}
                </table>
                ${additionalRowsHtml}
                ${binaryDataHtml}
            </body>
            </html>`;
    }

    private _escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
import * as vscode from 'vscode';
import { MetadataProvider } from './metadataProvider';
import { MetadataPanel } from './metadataPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Meta Viewer extension is now active!');

    let disposable = vscode.commands.registerCommand('meta-viewer.showMetadata', async (uri: vscode.Uri) => {
        if (!uri) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                uri = activeEditor.document.uri;
            } else {
                vscode.window.showInformationMessage('Please select a file to view metadata');
                return;
            }
        }

        const metadataProvider = new MetadataProvider();
        const metadata = await metadataProvider.getMetadata(uri);
        
        MetadataPanel.createOrShow(context.extensionUri, metadata);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
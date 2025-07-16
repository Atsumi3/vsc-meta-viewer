import * as assert from 'assert';
import * as vscode from 'vscode';
import { MetadataProvider } from '../../metadataProvider';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('MetadataProvider should be instantiable', () => {
        const provider = new MetadataProvider();
        assert.ok(provider);
    });

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('Atsumi3.meta-viewer'));
    });

    test('Should register commands', async () => {
        const extension = vscode.extensions.getExtension('Atsumi3.meta-viewer');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
        
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('meta-viewer.showMetadata'));
    });
});
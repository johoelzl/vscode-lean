import { Disposable, DocumentFilter, TextDocument, workspace, languages } from 'vscode';
import {Server} from './server';

export class LeanSyncService implements Disposable {
    private subscriptions: Disposable[] = [];

    constructor(private server: Server, private documentFilter: DocumentFilter) {
        this.subscriptions.push(workspace.onDidChangeTextDocument(
            (ev) => this.syncDoc(ev.document)));
        this.subscriptions.push(workspace.onDidOpenTextDocument(
            (ev) => this.syncDoc(ev)));

        // TODO(gabriel): unload files from server
        // this.subscriptions.push(workspace.onDidCloseTextDocument(???));

        // Sync files that are already open.
        this.syncAll();
 
        this.subscriptions.push(this.server.restarted.on(() => this.syncAll()));
    }

    private syncAll() {
        workspace.textDocuments.forEach((doc) => this.syncDoc(doc));
    }

    private syncDoc(doc: TextDocument) {
        if (!languages.match(this.documentFilter, doc)) return;
        this.server.sync(doc.fileName, doc.getText());
    }

    dispose() {
        for (const s of this.subscriptions) s.dispose();
    }
}
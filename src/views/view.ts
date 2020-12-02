"use strict";

import * as vscode from "vscode";
import * as path from "path";
import { getContext } from "../constants";
import LoadingHTMLGenerator from "../html/loadingHtml";
import NotFoundHTMLGenerator from "../html/NotFoundHtml";

/**
 * Abstract view.
 *
 * @abstract
 * @class AbstractView
 * @author sdttttt
 */
export default abstract class AbstractView {
	protected abstract readonly viewType: string;
	protected abstract readonly title: string;

	protected panelView: vscode.WebviewPanel | undefined;
	protected columToShowIn: vscode.ViewColumn | undefined;

	/**
	 * initializer an instance of abstract view.
	 */
	protected constructor() {
		this.columToShowIn = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		this.panelView = undefined;
	}

	/**
	 *  Quick Create a WebviewPanel
	 *
	 * @export
	 * @param {string} viewType
	 * @param {string} title
	 * @param {() => any} listener
	 * @returns {vscode.WebviewPanel}
	 *
	 * @author sdttttt
	 */
	private createWebviewPanel(
		closeListener: () => unknown
	): vscode.WebviewPanel {
		const context: vscode.ExtensionContext = getContext();

		const panel = vscode.window.createWebviewPanel(
			this.viewType,
			this.title,
			vscode.ViewColumn.Two,
			{
				retainContextWhenHidden: false,
				enableFindWidget: true,
				localResourceRoots: [
					vscode.Uri.file(
						path.join(context.extensionPath, "resources")
					),
				],
			}
		);

		panel.onDidDispose(closeListener, null, context.subscriptions);
		return panel;
	}

	/**
	 *  Show WebViewPanel
	 *  need Callback function
	 *
	 * @param {(pv: vscode.WebviewPanel) => void} callback
	 */
	protected openWebViewPanel(
		callback: (pv: vscode.WebviewPanel) => void
	): void {
		if (this.panelView) {
			this.panelView.reveal(this.columToShowIn);
			callback(this.panelView);
		} else {
			this.panelView = this.createWebviewPanel(() => {
				this.panelView = undefined;
			});

			callback(this.panelView);
		}
	}

	/**
	 * Shows loading view
	 *
	 * @author sdttttt
	 */
	protected showLoadingView(): void {
		this.openWebViewPanel((pv: vscode.WebviewPanel) => {
			pv.webview.html = LoadingHTMLGenerator.generateHTML();
		});
	}

	/**
	 * Show NotFound View.
	 *
	 * @protected
	 * @memberof AbstractView
	 * @author sdttttt
	 */
	protected showNotFoundView(): void {
		this.openWebViewPanel((pv: vscode.WebviewPanel) => {
			pv.webview.html = NotFoundHTMLGenerator.generateHTML();
		});
	}
}

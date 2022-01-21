import * as vscode from "vscode";
import { BangumiUrl } from "../request/bangumiUrl";
import { BangumisData } from "../request/structure";
declare const _default: {
    readonly viewType: string;
    readonly title: string;
    _pageNumber: number;
    _bangumiUrl: BangumiUrl;
    /**
     * Creates bangumi view
     *
     * @param bangumis
     * @author sdttttt
     */
    createBangumiView(bangumiRes: BangumisData | undefined): void;
    /**
     * show number of Page
     * @author sdttttt
     */
    showPageNumber(): void;
    /**
     * Gets bangumi url
     *
     * @author sdttttt
     */
    bangumiUrl: BangumiUrl;
    /**
     * Opens bangumi View
     *
     * @author sdttttt
     */
    openBangumi(): void;
    /**
     * Next Page
     *
     * @export
     * @author sdttttt
     */
    nextPage(): void;
    /**
     *  back Page
     *
     * @export
     * @author sdttttt
     */
    backPage(): void;
    /**
     * Jump to number of Page
     *
     * @export
     * @author sdttttt
     */
    jumpPage(): void;
    panelView: vscode.WebviewPanel | undefined;
    columToShowIn: vscode.ViewColumn | undefined;
    createWebviewPanel(closeListener: () => unknown): vscode.WebviewPanel;
    openWebViewPanel(callback: (pv: vscode.WebviewPanel) => void): void;
    showLoadingView(): void;
    showNotFoundView(): void;
};
/**
 * Bangumi View.
 *
 * @class BangumisView
 * @author sdttttt
 */
export default _default;

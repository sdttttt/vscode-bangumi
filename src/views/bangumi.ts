import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import BangumisHTMLGenerator from "../html/bangumiHtml";
import { BangumiUrl } from "../request/bangumiUrl";
import { Bangumi, BangumisData } from "../request/structure";
import { toNumber } from "../utils/type";
import AbstractView from "./view";

/**
 * Bangumi View.
 *
 * @class BangumisView
 * @author sdttttt
 */
export default new (class BangumisView extends AbstractView {
    protected readonly viewType: string = "html";
    protected readonly title: string = "bangumis";

    private _pageNumber: number;

    private _bangumiUrl: BangumiUrl;

    constructor() {
        super();
        this._bangumiUrl = new BangumiUrl();
        this._pageNumber = 1;
    }

    /**
     * Creates bangumi view
     *
     * @param bangumis
     * @author sdttttt
     */
    private createBangumiView(bangumiRes: BangumisData | undefined): void {
        if (!bangumiRes) {
            this.showNotFoundView();
            return;
        }

        const bangumis: Array<Bangumi> = bangumiRes.list;

        this.openWebViewPanel((pv: vscode.WebviewPanel) => {
            pv.webview.html = BangumisHTMLGenerator.generateHTML(
                bangumis,
                pv.webview
            );
        });
    }

    /**
     * show number of Page
     * @author sdttttt
     */
    private showPageNumber(): void {
        vscode.window.showInformationMessage(`🐶 第${this._pageNumber}页`);
    }

    /**
     * Gets bangumi url
     *
     * @author sdttttt
     */
    get bangumiUrl(): BangumiUrl {
        return this._bangumiUrl;
    }

    /**
     * Sets bangumi url
     *
     * @author sdttttt
     */
    set bangumiUrl(url: BangumiUrl) {
        this._bangumiUrl = url;
    }

    /**
     * Opens bangumi View
     *
     * @author sdttttt
     */
    openBangumi(): void {
        this.showLoadingView();

        getAllBangumi(this._bangumiUrl.setPage(this._pageNumber)).then(
            (data: BangumisData | undefined) => this.createBangumiView(data)
        );
    }

    /**
     * Next Page
     *
     * @export
     * @author sdttttt
     */
    nextPage(): void {
        this._pageNumber++;
        this.showPageNumber();
        this.openBangumi();
    }

    /**
     *  back Page
     *
     * @export
     * @author sdttttt
     */
    backPage(): void {
        if (1 < this._pageNumber) {
            this._pageNumber--;
            this.showPageNumber();
            this.openBangumi();
        } else {
            this._pageNumber = 1;
            vscode.window.showInformationMessage("😰真的一滴都没有了!");
            this.openBangumi();
        }
    }

    /**
     * Jump to number of Page
     *
     * @export
     * @author sdttttt
     */
    jumpPage(): void {
        const inputOptions: vscode.InputBoxOptions = {
            value: "1",
            prompt: "TIP: 如果一直在加载，那应该是没这一页了 🚀",
        };

        const inputResult = vscode.window.showInputBox(inputOptions);

        inputResult.then((text: string | undefined) => {
            const number = toNumber(text);
            if (0 === number) {
                vscode.window.showInformationMessage(`
        输入的内容,不能是0或者非数字
        数字大小不做限制.
      `);
                return;
            }
            this._pageNumber = number;
            this.openBangumi();
        });
    }
})();

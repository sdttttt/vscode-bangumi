import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import { BangumiUrl } from "../request/bangumiUrl";
import { BangumisData } from "../request/structure";
import { toNumber } from "../utils/type";
import { toBangumiPayloads } from "../webview/viewModel";
import type { WebviewCommand } from "../webview/protocol";
import AbstractView from "./view";

/**
 * Bangumi View.
 *
 * @class BangumisView
 * @author sdttttt
 */
export default new (class BangumisView extends AbstractView {
    protected readonly viewType: string = "bangumiOpen.list";
    protected readonly title: string = "bangumis";

    private _pageNumber: number;

    private _bangumiUrl: BangumiUrl;

    constructor() {
        super();
        this._bangumiUrl = new BangumiUrl();
        this._pageNumber = 1;
    }

    /**
     * Renders a page of bangumi results.
     *
     * @author sdttttt
     */
    private createBangumiView(bangumiRes: BangumisData | undefined): void {
        if (!bangumiRes) {
            this.showNotFoundView();
            return;
        }

        this.render({
            kind: "bangumi",
            page: this._pageNumber,
            bangumis: toBangumiPayloads(bangumiRes.list),
        });
    }

    /**
     * show number of Page
     * @author sdttttt
     */
    private showPageNumber(): void {
        vscode.window.showInformationMessage(`第${this._pageNumber}页`);
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
            vscode.window.showInformationMessage("真的一滴都没有了!");
            this.openBangumi();
        }
    }

    /**
     * Asks the user for a page number and opens it.
     *
     * @export
     * @author sdttttt
     */
    jumpPage(): void {
        const inputOptions: vscode.InputBoxOptions = {
            value: "1",
            prompt: "TIP: 如果一直在加载，那应该是没这一页了",
        };

        vscode.window
            .showInputBox(inputOptions)
            .then((text: string | undefined) => {
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

    /**
     * Routes the pager commands sent by the webview.
     *
     * @author sdttttt
     */
    protected handleWebviewCommand(command: WebviewCommand): void {
        switch (command.type) {
            case "bangumi:nextPage":
                this.nextPage();
                break;
            case "bangumi:backPage":
                this.backPage();
                break;
            case "bangumi:jumpPage":
                this.jumpPage();
                break;
        }
    }
})();

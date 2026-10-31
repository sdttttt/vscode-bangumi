"use strict";

import AbstractHTMLGenerator from "./generator";
import { getResourceFile } from "../utils/file";
import { LOADING_CSS, ENTERRPRISE } from "../constants";
import * as vscode from "vscode";

/**
 * Not Found Html Generator.
 *
 * @class NotFoundHTMLGenerator
 * @author sdttttt
 */
export default new (class NotFoundHTMLGenerator extends AbstractHTMLGenerator<undefined> {
    protected style?: string;
    protected html?: string;

    generateHTML(data: undefined, webview: vscode.Webview): string {
        const loadImg: vscode.Uri = getResourceFile(webview, ENTERRPRISE);
        this.makeCssUri(webview, LOADING_CSS);
        /* 资源 URI 与 Webview 绑定，不能跨面板复用，因此每次重新生成 */
        this.html = `<div class="load"><img src="${loadImg}"><h3>没有数据!</h3></div>`;

        return (
            this.htmlHead +
            this.style +
            this.htmlBody +
            this.html +
            this.htmlFloor
        );
    }
})();

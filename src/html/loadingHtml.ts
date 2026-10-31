"use strict";

import AbstractHTMLGenerator from "./generator";
import * as vscode from "vscode";
import { getResourceFile } from "../utils/file";
import { HUIHUI, LOADING_CSS } from "../constants";

/**
 * Loading Html Generator.
 *
 * @class LoadingHTMLGenerator
 * @author sdttttt
 */
export default new (class LoadingHTMLGenerator extends AbstractHTMLGenerator<undefined> {
    protected style?: string;

    protected html?: string;

    generateHTML(data: undefined, webview: vscode.Webview): string {
        const loadimg: vscode.Uri = getResourceFile(webview, HUIHUI);
        this.makeCssUri(webview, LOADING_CSS);
        /* 资源 URI 与 Webview 绑定，不能跨面板复用，因此每次重新生成 */
        this.html = `<div class="load"><img style="width:120px;height:130px;" src="${loadimg}"><h3>Loading...</h3></div>`;

        return (
            this.htmlHead +
            this.style +
            this.htmlBody +
            this.html +
            this.htmlFloor
        );
    }
})();

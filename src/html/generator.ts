"use strict";

import { getResourceFile } from "../utils/file";
import * as vscode from "vscode";
/**
 * Html Generator
 *
 * @template T input Data
 * @abstract AbstractHTMLGenerator
 * @author sdttttt
 */
export default abstract class AbstractHTMLGenerator<T = unknown | undefined> {

    protected abstract style?: string;

    protected readonly htmlBody: string = "<body><div class=\"container\">";
    protected readonly htmlHead: string = "<html>";
    protected readonly htmlFloor: string = "</div></body></html>";

    protected abstract html?: string;

    abstract generateHTML(data: T): string;

    protected makeCssUri(path: string): void {
        const cssPath: vscode.Uri = getResourceFile(path);
        this.style = `<link rel="stylesheet" href="${cssPath}">`;
    }
}
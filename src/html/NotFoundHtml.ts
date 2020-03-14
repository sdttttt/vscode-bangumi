"use strict";

import AbstractHTMLGenerator from "./generator";
import { getResourceFile } from "../utils/file";
import { LoadingCSS, enterprise } from "../constants";
import { Uri } from "vscode";

/**
 * Not Found Html Generator.
 *
 * @class NotFoundHTMLGenerator
 * @author sdttttt
 */
export default new class NotFoundHTMLGenerator extends AbstractHTMLGenerator<undefined> {
	protected style?: string;
	protected html?: string;

	generateHTML(): string {
		if (!this.html) {
			const loadImg: Uri = getResourceFile(enterprise);
			this.makeCssUri(LoadingCSS);
			this.html = `<div class="load"><img src="${loadImg}"><h3>没有数据!</h3></div>`;
			this.html = this.htmlHead + this.style + this.htmlBody + this.html + this.htmlFloor;
		}
		return this.html;
	}
};
"use strict";

import AbstractHTMLGenerator from "./generator";
import { Uri } from "vscode";
import { getResourceFile } from "../utils/file";
import { huihui, LoadingCSS } from "../constants";

/**
 * Loading Html Generator.
 *
 * @class LoadingHTMLGenerator
 * @author sdttttt
 */
export default new class LoadingHTMLGenerator extends AbstractHTMLGenerator<undefined> {
	protected style?: string;

	protected html?: string;

	generateHTML(): string {
		if (!this.html) {
			const loadimg: Uri = getResourceFile(huihui);
			this.makeCssUri(LoadingCSS);
			this.html = `<div class="load"><img style="width:120px;height:130px;" src="${loadimg}"><h3>Loading...</h3></div>`;
			this.html = this.htmlHead + this.style + this.htmlBody + this.html + this.htmlFloor;
		}
		return this.html;
	}
};
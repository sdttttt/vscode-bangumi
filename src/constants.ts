"use strict";

// eslint-disable-next-line no-unused-vars
import * as vscode from "vscode";

export const yinglili = "heiheihei.gif";

export const huihui = "loading.gif";

export const WeekBangumiCSS = "css/weekBangumi.css";
export const BangumiCSS = "css/bangumi.css";
export const LoadingCSS = "css/loading.css";

let _context: vscode.ExtensionContext;

/**
 * Initializer Context
 *
 * @param {vscode.ExtensionContext}
 * @author sdttttt
 */
export function setContext(ctx: vscode.ExtensionContext): void {
	_context = ctx;
}

/**
 * Get Context
 *
 * @returns {vscode.ExtensionContext}
 * @author sdttttt
 */
export function getContext(): vscode.ExtensionContext {
	return _context;
}
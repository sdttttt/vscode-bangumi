// eslint-disable-next-line no-unused-vars
import * as vscode from "vscode";

export const YING_LILI = "heiheihei.gif";

export const HUIHUI = "loading.gif";

export const ENTERRPRISE = "enterprise.jpg";

export const WEEK_BANGUMI_CSS = "css/weekBangumi.css";
export const BANGUMI_CSS = "css/bangumi.css";
export const LOADING_CSS = "css/loading.css";

let _context: vscode.ExtensionContext;

/**
 * Initializer Context
 *
 * @param {vscode.ExtensionContext}
 * @author sdttttt
 */
export function setContext(ctx: vscode.ExtensionContext): void
{
    _context = ctx;
}

/**
 * Get Context
 *
 * @returns {vscode.ExtensionContext}
 * @author sdttttt
 */
export function getContext(): vscode.ExtensionContext
{
    return _context;
}

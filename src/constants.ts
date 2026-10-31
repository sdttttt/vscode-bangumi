import * as vscode from "vscode";

export const YING_LILI = "heiheihei.gif";

export const HUIHUI = "loading.gif";

export const ENTERRPRISE = "enterprise.jpg";

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

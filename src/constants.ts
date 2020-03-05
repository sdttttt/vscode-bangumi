import * as vscode from "vscode";

export const yinglili: string = "heiheihei.gif";

export const huihui: string = "loading.gif";

let _context: vscode.ExtensionContext;

/**
 * Initializer Context
 *
 * @param {vscode.ExtensionContext}
 * @author sdttttt
 */
export function setContext(ctx: vscode.ExtensionContext) {
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
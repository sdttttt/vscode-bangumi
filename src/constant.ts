import * as vscode from "vscode";

/**
 *  Define the need Init Global variable.
 *
 * @class Global
 * @author sdttttt
 */
class Global {

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    private readonly _context: vscode.ExtensionContext;

    get context(): vscode.ExtensionContext {
        return this._context;
    }
}

// Single Instance
let global: Global;

export function newGlobal(context: vscode.ExtensionContext) {
    global = new Global(context);
}

export function globalVar() {
    return global;
}
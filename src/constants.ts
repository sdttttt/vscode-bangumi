import * as vscode from "vscode";

/**
 *  Define the need Init Global variable.
 *
 * @class Global
 * @author sdttttt
 * 
 * FIXME:
 *  Extension 中各个位置都依赖**vscode.ExtensionContext**.
 *  将它在调用的时候，开始初始化，并封装了起来.
 *  看起来没什么问题，但是在 **vscode** 的 **TDD** 中，Context经常被解释器认为，没有初始化
 *  为此，我需要更可靠的测试或一种新的设计模式.
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

/**
 * News global
 * @param context
 * @author sdttttt
 */
export function newGlobal(context: vscode.ExtensionContext) {
    global = new Global(context);
}

/**
 * Globals var
 * 
 * @returns {Global} var
 * @author sdttttt 
 */
export function globalVar(): Global {
    return global;
}
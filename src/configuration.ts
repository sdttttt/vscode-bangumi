import * as vscode from "vscode";

/**
 * Quick Gets config
 *
 * @param {string} key
 * @returns {any}
 * @export
 *
 * @author sdttttt
 */
export function getConfig(key: string): any {
    return vscode.workspace.getConfiguration().get(key);
}
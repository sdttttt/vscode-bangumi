import * as vscode from "vscode";
import * as path from "path";
import {
    getContext
} from "../constants";

/**
 * Gets resource Uri usable inside a Webview.
 *
 * The old `vscode-resource` scheme is deprecated, `asWebviewUri` is the
 * supported way to reference extension files from Webview HTML.
 *
 * @param webview the Webview that will load the resource
 * @param filename resource file name, relative to `resources/`
 * @returns resource file
 * @author sdttttt
 */
export function getResourceFile(
    webview: vscode.Webview,
    filename: string
): vscode.Uri
{
    const onDiskPath = vscode.Uri.file(
        path.join(getContext().extensionPath, "resources", filename)
    );
    return webview.asWebviewUri(onDiskPath);
}

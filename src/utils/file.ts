import * as vscode from "vscode";
import * as path from "path";

/**
 * 获取 Webview 中可用的资源 Uri。
 *
 * 旧的 `vscode-resource` scheme 已废弃，`asWebviewUri` 才是从 Webview HTML
 * 引用扩展文件的受支持方式。
 *
 * @param webview 将要加载该资源的 Webview
 * @param filename 资源文件名，相对于 `resources/`
 * @param extensionPath 已安装扩展的根目录
 * @returns 资源文件
 * @author sdttttt
 */
export function getResourceFile(
    webview: vscode.Webview,
    filename: string,
    extensionPath: string
): vscode.Uri {
    const onDiskPath = vscode.Uri.file(
        path.join(extensionPath, "resources", filename)
    );
    return webview.asWebviewUri(onDiskPath);
}

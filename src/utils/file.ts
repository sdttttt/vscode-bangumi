"use strict";

import * as vscode from "vscode";
import * as path from "path";
import { getContext } from "../constants";

/**
 * Gets resource file
 *
 * @param filename
 * @returns resource file
 * @author sdttttt
 */
export function getResourceFile(filename: string): vscode.Uri {
	const onDiskPath = vscode.Uri.file(
		path.join(getContext().extensionPath, "resources", filename)
	);
	return onDiskPath.with({ scheme: "vscode-resource" });
}

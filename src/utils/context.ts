import * as vscode from "vscode";
import { CONTEXT } from "../extension"; 

const Context: vscode.ExtensionContext = CONTEXT;

/**
 * getExtensionContext => get By this function to Get Context of vscode
 * @returns  vscode.ExtensionContext
 * @author sdttttt
 */
export const getExtensionContext: () => vscode.ExtensionContext = () => Context;
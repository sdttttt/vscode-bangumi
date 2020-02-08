import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { getExtensionContext } from "../utils/context";

export function getAllBangumi( callback: (data: any,) => void) {
    vscode.window.showInformationMessage("opening Bangumi ...");
    Axios.get("http://bangumi.bilibili.com/jsonp/timeline_v2.ver").then( (res: AxiosResponse ) => {
        callback(res.data);
    });
}
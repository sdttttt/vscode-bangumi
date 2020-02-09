import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BANGUMI_SHOW } from "../utils/constant";


/**
 * HTTP Request Gets all bangumi
 * @param callback 
 * @author sdttttt
 */
export function getAllBangumi( callback: (data: any,) => void) {
    vscode.window.showInformationMessage("opening Bangumi ...");
    Axios.get(BANGUMI_SHOW)
    .then( (res: AxiosResponse ) => {
        callback(res.data);
    });
}
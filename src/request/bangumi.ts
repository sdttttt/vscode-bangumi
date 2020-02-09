import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl } from '../utils/constant';

/**
 * HTTP Request Gets all bangumi
 * @param callback 
 * @author sdttttt
 */
export function getAllBangumi(burl: BangumiUrl , callback: (data: any,) => void) {
    
    const url: string = burl.build().finalUrl;

    vscode.window.showInformationMessage("opening Bangumi ...");
    
    Axios.get(url)
    .then( (res: AxiosResponse ) => {
        callback(res.data);
    });
}
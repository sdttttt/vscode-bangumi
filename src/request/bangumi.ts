import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl } from '../utils/bangumi_url';
import { BangumisResponse } from "./structure";

/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @author sdttttt
 */
export function getAllBangumi(burl: BangumiUrl, callback: (data: BangumisResponse) => void) {

    const url: string = burl.build().finalUrl;

    Axios.get(url)
    .then( (res: AxiosResponse ) => {
        callback(<BangumisResponse>(res.data));
    });
}
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
        .then((res: AxiosResponse) => {
            const bangumisResponse = <BangumisResponse>(res.data);
            if (bangumisResponse.code !== 0) {
                vscode.window.showInformationMessage(`
                    Oops! B站可能炸了! 或许是API地址更改了./(ㄒoㄒ)/~~
                    https://github.com/sdttttt/vscode-bangumi/issues
                `);
                return;
            }
            callback(bangumisResponse);
    });
}
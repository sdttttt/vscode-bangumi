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
                    Oops! B站可能炸了! 或许是API地址更改了./(ㄒoㄒ)/~~d
                    https://github.com/sdttttt/vscode-bangumi/issues
                `);
                return;
            }

            if (JSON.stringify(bangumisResponse.data) === "{}") {
                vscode.window.showInformationMessage(`
                  获取数据为空🤔
                `);
                return;
            }

            callback(bangumisResponse);
        }).catch((reason: any) => {
            vscode.window.showWarningMessage("输入数字大概在100左右就到头了.");
            console.log(reason);
        });
}
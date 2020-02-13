import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl, BANGUMI_WEEK } from './bangumi_url';
import { BangumisResponse, WeekBangumiData, WeekBangumiResponse, BangumisData } from './structure';
import { isEmptyArray, isEmptyObject } from '../utils/type';

/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @author sdttttt
 */
export function getAllBangumi(burl: BangumiUrl, callback: (data: BangumisData) => void) {

    const url: string = burl.build().finalUrl;

    Axios.get(url)
        .then((res: AxiosResponse<BangumisResponse>) => {
            const bangumisResponse = res.data;
            if (bangumisResponse.code !== 0) {
                vscode.window.showInformationMessage(`
                    Oops! B站可能炸了! 或许是API地址更改了./(ㄒoㄒ)/~~d
                    https://github.com/sdttttt/vscode-bangumi/issues
                `);
                return;
            }

            if (isEmptyObject(bangumisResponse.data) || isEmptyArray(bangumisResponse.data.list)) {
                vscode.window.showInformationMessage(`
                  获取数据为空🤔
                `);
                return;
            }

            callback(bangumisResponse.data);
        }).catch((reason: any) => {
            vscode.window.showWarningMessage("输入数字大概在100左右就到头了.");
            console.log(reason);
        });
}


export function getWeekBangumi(callback: (data: Array<WeekBangumiData>) => void) {

    Axios.get(BANGUMI_WEEK)
        .then((res: AxiosResponse<WeekBangumiResponse>) => {
            const weekBangumiResponse = res.data;
            if (weekBangumiResponse.code === 0) {
                vscode.window.showInformationMessage(`
                    Oops! B站可能炸了! 或许是API地址更改了./(ㄒoㄒ)/~~d
                    https://github.com/sdttttt/vscode-bangumi/issues
                `);
                return;
            }

            if (isEmptyArray(weekBangumiResponse.result)) {
                vscode.window.showInformationMessage(`
                  获取数据为空🤔
                `);
                return;
            }

            callback(weekBangumiResponse.result);
        }).catch((reason: any) => {
            vscode.window.showInformationMessage("出现问题了!! /(ㄒoㄒ)/");
            console.log(reason);
        });
}
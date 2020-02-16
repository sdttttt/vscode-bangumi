import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl, BANGUMI_WEEK } from './bangumi_url';
import { BangumisResponse, WeekBangumiData, WeekBangumiResponse, BangumisData, isSuccess } from './structure';
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
            isSuccess(bangumisResponse);

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

/**
 * Gets week bangumi
 * @param {(data: Array<WeekBangumiData>) => void} callback 
 */
export function getWeekBangumi(callback: (data: Array<WeekBangumiData>) => void) {

Axios.get(BANGUMI_WEEK)
        .then((res: AxiosResponse<WeekBangumiResponse>) => {
            const weekBangumiResponse = res.data;
            isSuccess(weekBangumiResponse);
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
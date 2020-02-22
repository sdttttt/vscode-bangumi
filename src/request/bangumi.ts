import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl, BANGUMI_WEEK } from './bangumi_url';
import { isEmptyArray, isEmptyObject } from '../utils/type';
import {
    BangumisResponse,
    WeekBangumiData,
    WeekBangumiResponse,
    BangumisData,
    isSuccess
} from './structure';

/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @async
 * @author sdttttt
 */
export async function getAllBangumi(burl: BangumiUrl): Promise<BangumisData | undefined> {

    const url: string = burl.build().finalUrl;

    const res: AxiosResponse<BangumisResponse> =
        await Axios.get<any, AxiosResponse<BangumisResponse>>(url);

    const bangumisResponse: BangumisResponse = res.data;
    isSuccess(bangumisResponse);

    if (isEmptyObject(bangumisResponse.data) || isEmptyArray(bangumisResponse.data.list)) {
        vscode.window.showInformationMessage(`
            获取数据为空🤔
        `);
        return;
    }

    return bangumisResponse.data;
}

/**
 * Gets week bangumi
 *
 * @param {(data: Array<WeekBangumiData>) => void} callback
 * @async
 * @author sdttttt
 */
export async function getWeekBangumi(): Promise<Array<WeekBangumiData> | undefined> {

    const res: AxiosResponse<WeekBangumiResponse> =
        await Axios.get<any, AxiosResponse<WeekBangumiResponse>>(BANGUMI_WEEK);

    const weekBangumiResponse = res.data;
    isSuccess(weekBangumiResponse);

    if (isEmptyArray(weekBangumiResponse.result)) {
        vscode.window.showInformationMessage(`
            获取数据为空🤔
        `);
        return;
    }

    return weekBangumiResponse.result;
}
"use strict";

import * as vscode from "vscode";
import {
    isEmptyArray, isEmptyObject
} from "../utils/type";

/**
 * Determines whether success is
 *
 * @param {BiliResponse} res
 * @returns true if success
 * @author sdttttt
 */
export function isSuccess(res: BiliResponse): boolean
{
    if (0 === res.code && "success" === res.message)
    {
        return true;
    }

    vscode.window.showInformationMessage(`
        Oops! 可能是B站炸了, 也或许是API地址更改了./(ㄒoㄒ)/~~d
        如果确认不是B站炸了,请尽快在Github上联系我!
    `);

    return false;
}

/**
 *  The bangumisResponse is Valid Bangumis Request ?
 *
 * @export
 * @param {BangumisResponse} bangumisResponse
 * @returns
 * @author sdttttt
 */
export function isValidBangumisRequest(
    bangumisResponse: BangumisResponse
): boolean
{
    return (
        isSuccess(bangumisResponse) &&
        !isEmptyObject(bangumisResponse.data) &&
        !isEmptyArray(bangumisResponse.data.list)
    );
}

/**
 * Bili response
 *
 * @interface BiliResponse
 * @author sdttttt
 */
export interface BiliResponse {
    // 0 is Success
    code: number;

    // success
    message: string;
}

/**
 * Structure of Bangumi Response
 *
 * @export
 * @interface BangumisResponse
 * @author sdttttt
 */
export interface BangumisResponse extends BiliResponse {
    data: BangumisData;
}

/**
 *  Bangumi Data
 *
 * @export
 * @interface BangumisData
 * @author sdttttt
 */
export interface BangumisData {
    has_next: number;

    list: Array<Bangumi>;
}

/**
 * Bangumi Structure
 *
 * @export
 * @interface Bangumis
 * @author sdttttt
 */
export interface Bangumi {
    // Bangumis of Bilibili, need Play permission
    badge: string;
    // Number of sets
    cover: string;
    // 几集了
    index_show: string;
    // The end?
    is_finish: number;
    // Play Address
    link: string;
    // count of Chase Bangumi
    order: string;
    // Bangumi name
    title: string;
}

//=============================== Week Bangumi =============================

/**
 *  Week Bangumi Response
 *
 * @export
 * @interface WeekBangumiResponse
 * @author sdttttt
 */
export interface WeekBangumiResponse extends BiliResponse {
    result: Array<WeekBangumiData>;
}

/**
 * Week Bangumi Data
 *
 * @export
 * @interface WeekBangumiData
 * @author sdttttt
 */
export interface WeekBangumiData {
    date: string;
    date_ts: number;
    day_of_week: number;
    is_today: number;
    seasons: Array<WBangumi>;
}

/**
 * Bangumi of Week
 *
 * @export
 * @interface WBangumi
 * @author sdttttt
 */
export interface WBangumi {
    cover: string;
    favorites: number;
    is_published: number;
    pub_index: string;
    pub_time: string;
    pub_ts: number;
    square_cover: string;
    title: string;
    url: string;

    delay: number;
    delay_index: string;
    delay_reason: string;
}

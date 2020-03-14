"use strict";

import * as vscode from "vscode";
import Axios from "./instance";
import { AxiosResponse } from "axios";
import { BangumiUrl, BANGUMI_WEEK } from "./bangumiUrl";
import { isEmptyArray, isEmptyObject } from "../utils/type";
import { BangumiCache, WeekBangumiCache } from "./cache";
import {
	BangumisResponse,
	WeekBangumiData,
	WeekBangumiResponse,
	BangumisData,
	isSuccess,
	isValidBangumisRequest as isValidBangumisRequest
} from "./structure";



/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @async
 * @author sdttttt
 */
export async function getAllBangumi(burl: BangumiUrl): Promise<BangumisData | undefined> {

	const url: string = burl.build().finalUrl;

	const cacheData: BangumisData | undefined = BangumiCache.get(url);
	let result: BangumisData | undefined = cacheData;

	if (!cacheData) {
		const res: AxiosResponse<BangumisResponse> =
            await Axios.get<unknown, AxiosResponse<BangumisResponse>>(url);

		const bangumisResponse: BangumisResponse = res.data;

		if (!isValidBangumisRequest(bangumisResponse)) {
			return;
		}
		result = bangumisResponse.data;
		BangumiCache.set(url, result);
	}

	return result;
}



/**
 * Gets week bangumi
 *
 * @param {(data: Array<WeekBangumiData>) => void} callback
 * @async
 * @author sdttttt
 */
export async function getWeekBangumi(): Promise<Array<WeekBangumiData> | undefined> {

	const cacheData: Array<WeekBangumiData> | undefined =
        WeekBangumiCache.get(BANGUMI_WEEK);

	let result: Array<WeekBangumiData> | undefined = cacheData;

	if (!cacheData) {
		const res: AxiosResponse<WeekBangumiResponse> =
            await Axios.get<unknown, AxiosResponse<WeekBangumiResponse>>(BANGUMI_WEEK);

		const weekBangumiResponse = res.data;

		if ( !isSuccess(weekBangumiResponse) || isEmptyArray(weekBangumiResponse.result)) {
			vscode.window.showInformationMessage(`
            	咳咳，什么都没有找到🤔
        	`);
			return;
		}
		result = weekBangumiResponse.result;
		WeekBangumiCache.set(BANGUMI_WEEK, result);
	}


	return result;
}
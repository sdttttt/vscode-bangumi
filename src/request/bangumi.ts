import { window } from "vscode";
import { BangumiUrl, BANGUMI_WEEK } from "./bangumiUrl";
import { getJson } from "./http";
import { isEmptyArray } from "../utils/type";
import { BangumiCache, WeekBangumiCache } from "./cache";
import {
    BangumisResponse,
    WeekBangumiData,
    WeekBangumiResponse,
    BangumisData,
    isSuccess,
    isValidBangumisRequest,
} from "./structure";

/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @async
 * @author sdttttt
 */
export async function getAllBangumi(
    burl: BangumiUrl
): Promise<BangumisData | undefined> {
    const url: string = burl.build().finalUrl;

    const cacheData: BangumisData | undefined = BangumiCache.get(url);
    let result: BangumisData | undefined = cacheData;

    if (!cacheData) {
        const bangumisResponse = await getJson<BangumisResponse>(url);

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
export async function getWeekBangumi(): Promise<
    Array<WeekBangumiData> | undefined
> {
    const cacheData: Array<WeekBangumiData> | undefined =
        WeekBangumiCache.get(BANGUMI_WEEK);

    let result: Array<WeekBangumiData> | undefined = cacheData;

    if (!cacheData) {
        let weekBangumiResponse: WeekBangumiResponse;
        try {
            weekBangumiResponse =
                await getJson<WeekBangumiResponse>(BANGUMI_WEEK);
        } catch {
            /*
             * A network failure is reported like an empty schedule: the view
             * falls back to "not found" and the reminder retries on its own.
             */
            window.showInformationMessage("咦？没有找到番剧时间表……");
            return;
        }

        if (
            !isSuccess(weekBangumiResponse) ||
            isEmptyArray(weekBangumiResponse.result)
        ) {
            window.showInformationMessage("咦？没有找到番剧时间表……");
            return;
        }
        result = weekBangumiResponse.result;
        WeekBangumiCache.set(BANGUMI_WEEK, result);
    }

    return result;
}

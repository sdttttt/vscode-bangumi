import { BANGUMI_WEEK } from "./query";
import { getJson } from "./http";
import type { Notifier } from "../notifier";
import { isEmptyArray } from "../utils/type";
import type { RequestCaches } from "./cache";
import {
    BangumisResponse,
    WeekBangumiData,
    WeekBangumiResponse,
    BangumisData,
    isSuccess,
    isValidBangumisRequest,
} from "./structure";

/**
 * Message shown when the API answers with something unusable.
 *
 * @author sdttttt
 */
const BROKEN_RESPONSE_MESSAGE = `
        出错了！可能是 B 站服务异常，也可能是接口地址变了。/(ㄒoㄒ)/~~
        如果确认不是 B 站的问题，请尽快在 GitHub 上联系我！
    `;

/**
 * Message shown when the weekly schedule cannot be pulled.
 *
 * @author sdttttt
 */
const MISSING_SCHEDULE_MESSAGE = "咦？没有找到番剧时间表……";

/**
 * The bangumi endpoints of one extension session.
 *
 * @author sdttttt
 */
export interface BangumiApi {
    /**
     * Gets all bangumi of one page.
     *
     * The url is built by `buildBangumiUrl` and doubles as the cache key, so
     * the request layer never has to know which filter produced it.
     */
    getAllBangumi(url: string): Promise<BangumisData | undefined>;
    /** Gets the weekly schedule. */
    getWeekBangumi(): Promise<Array<WeekBangumiData> | undefined>;
}

/**
 * Creates the bangumi endpoints of one extension session.
 *
 * @param caches session caches owned by the composition root
 * @param notifier user facing output of the session
 * @author sdttttt
 */
export function useBangumiApi(
    caches: RequestCaches,
    notifier: Notifier
): BangumiApi {
    return {
        getAllBangumi: async url => {
            const cached = caches.bangumi.get(url);
            if (cached) {
                return cached;
            }

            const response = await getJson<BangumisResponse>(url);

            if (!isValidBangumisRequest(response)) {
                if (!isSuccess(response)) {
                    notifier.info(BROKEN_RESPONSE_MESSAGE);
                }
                return;
            }

            caches.bangumi.set(url, response.data);
            return response.data;
        },

        getWeekBangumi: async () => {
            const cached = caches.week.get(BANGUMI_WEEK);
            if (cached) {
                return cached;
            }

            let response: WeekBangumiResponse;
            try {
                response = await getJson<WeekBangumiResponse>(BANGUMI_WEEK);
            } catch {
                /*
                 * A network failure is reported like an empty schedule: the
                 * view falls back to "not found" and the reminder retries on
                 * its own.
                 */
                notifier.info(MISSING_SCHEDULE_MESSAGE);
                return;
            }

            if (!isSuccess(response)) {
                notifier.info(BROKEN_RESPONSE_MESSAGE);
                return;
            }

            if (isEmptyArray(response.result)) {
                notifier.info(MISSING_SCHEDULE_MESSAGE);
                return;
            }

            caches.week.set(BANGUMI_WEEK, response.result);
            return response.result;
        },
    };
}

import { BANGUMI_WEEK } from "./query";
import { getJson } from "../http";
import type { Notifier } from "../../notifier";
import { isEmptyArray } from "../../utils/type";
import type { RequestCaches } from "../cache";
import {
    BangumisResponse,
    WeekBangumiData,
    WeekBangumiResponse,
    BangumisData,
    isSuccess,
    isValidBangumisRequest,
} from "./schema";

/**
 * 接口返回不可用内容时展示的消息。
 *
 * @author sdttttt
 */
const BROKEN_RESPONSE_MESSAGE = `
        出错了！可能是 B 站服务异常，也可能是接口地址变了。/(ㄒoㄒ)/~~
        如果确认不是 B 站的问题，请尽快在 GitHub 上联系我！
    `;

/**
 * 一次扩展会话使用的 Bilibili 接口。
 *
 * @author sdttttt
 */
export interface BilibiliApi {
    /**
     * 获取某一页的全部番剧。
     *
     * 地址由 `buildBangumiUrl` 构建，同时充当缓存键，
     * 因此请求层无需知道是哪个筛选条件产生了它。
     */
    getAllBangumi(url: string): Promise<BangumisData | undefined>;
    /** 获取周番数据。 */
    getWeekBangumi(): Promise<Array<WeekBangumiData> | undefined>;
}

/**
 * 创建一次扩展会话使用的 Bilibili 接口。
 *
 * @param caches 由组合根持有的会话缓存
 * @param notifier 会话面向用户的输出
 * @author sdttttt
 */
export function createBilibiliApi(
    caches: RequestCaches,
    notifier: Notifier
): BilibiliApi {
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
                 * 网络失败按空日程上报：视图会回退到另一个来源或展示不可用，
                 * 提醒则由可用性探测统一重试。这里不弹提示，否则重试期间会
                 * 反复打扰用户。
                 */
                return;
            }

            if (!isSuccess(response) || isEmptyArray(response.result)) {
                return;
            }

            caches.week.set(BANGUMI_WEEK, response.result);
            return response.result;
        },
    };
}

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
    /*
     * 正在进行的请求按地址去重：午夜 rollover 的提醒刷新与用户此刻打开
     * 周番面板并发时，同一地址只发一次请求、写一次缓存。
     */
    const pendingBangumi = new Map<string, Promise<BangumisData | undefined>>();
    let pendingWeek: Promise<Array<WeekBangumiData> | undefined> | undefined;

    return {
        getAllBangumi: url => {
            const cached = caches.bangumi.get(url);
            if (cached) {
                return Promise.resolve(cached);
            }

            const inFlight = pendingBangumi.get(url);
            if (inFlight) {
                return inFlight;
            }

            const request = (async () => {
                try {
                    let response: BangumisResponse;
                    try {
                        response = await getJson<BangumisResponse>(url);
                    } catch {
                        /* 网络失败与周番路径保持同一形态：上报后返回空数据。 */
                        notifier.info(BROKEN_RESPONSE_MESSAGE);
                        return;
                    }

                    if (!isValidBangumisRequest(response)) {
                        if (!isSuccess(response)) {
                            notifier.info(BROKEN_RESPONSE_MESSAGE);
                        }
                        return;
                    }

                    caches.bangumi.set(url, response.data);
                    return response.data;
                } finally {
                    /*
                     * 在请求结算的同时清槽：清理若排在结算之后的微任务里，
                     * 紧随其后的顺序调用会误复用已完成的 promise。
                     */
                    pendingBangumi.delete(url);
                }
            })();
            pendingBangumi.set(url, request);
            return request;
        },

        /*
         * 周番路径保持静默：它同时被后台的提醒重试与用户打开的视图消费，
         * 在数据层弹窗会让离线重试的每一轮都打扰一次。何时提示由调用方
         * 决定——视图有「未找到」页面兜底，提醒按失败序列只报一次。
         */
        getWeekBangumi: () => {
            const cached = caches.week.get(BANGUMI_WEEK);
            if (cached) {
                return Promise.resolve(cached);
            }

            if (pendingWeek) {
                return pendingWeek;
            }

            const request = (async () => {
                try {
                    let response: WeekBangumiResponse;
                    try {
                        response =
                            await getJson<WeekBangumiResponse>(BANGUMI_WEEK);
                    } catch {
                        return;
                    }

                    if (!isSuccess(response)) {
                        return;
                    }

                    if (isEmptyArray(response.result)) {
                        return;
                    }

                    caches.week.set(BANGUMI_WEEK, response.result);
                    return response.result;
                } finally {
                    /* 同 getAllBangumi：在结算的同时清槽，顺序调用不被误复用。 */
                    pendingWeek = undefined;
                }
            })();
            pendingWeek = request;
            return request;
        },
    };
}

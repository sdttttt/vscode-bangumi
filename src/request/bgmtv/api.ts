import { getJson } from "../http";
import type { RequestCaches } from "../cache";
import { BANGUMI_CALENDAR } from "./query";
import {
    isUsableCalendarDay,
    isValidCalendar,
    type BgmCalendarDay,
} from "./schema";

/**
 * 一次扩展会话使用的 Bangumi（bgm.tv）接口。
 *
 * @author sdttttt
 */
export interface BgmTvApi {
    /** 获取每日放送的原始数据，七天各一组。 */
    getCalendar(): Promise<Array<BgmCalendarDay> | undefined>;
}

/**
 * 创建一次扩展会话使用的 Bangumi 接口。
 *
 * 失败路径保持静默：它同时被后台的提醒重试与用户打开的视图消费，何时提示
 * 由调用方决定。返回 undefined 表示本次没有可用数据。
 *
 * 失败时只返回 `undefined`，不在这里弹提示：调用方可能正在重试，也可能已经
 * 回退到另一个来源，提示应当由最终决定「怎么展示」的一层负责。
 *
 * @param caches 由组合根持有的会话缓存
 * @author sdttttt
 */
export function createBgmTvApi(caches: RequestCaches): BgmTvApi {
    /* 正在进行的请求去重：每日放送只有一个地址，一个槽位就够。 */
    let pendingCalendar: Promise<Array<BgmCalendarDay> | undefined> | undefined;

    return {
        getCalendar: () => {
            const cached = caches.calendar.get(BANGUMI_CALENDAR);
            if (cached) {
                return Promise.resolve(cached);
            }

            if (pendingCalendar) {
                return pendingCalendar;
            }

            const request = (async () => {
                try {
                    let days: unknown;
                    try {
                        days = await getJson<unknown>(BANGUMI_CALENDAR);
                    } catch {
                        return;
                    }

                    if (!isValidCalendar(days)) {
                        return;
                    }

                    /*
                     * 校验只保证「至少一天可用」：把坏天滤掉再缓存，结构残缺
                     * 的天不会流进适配器把整页渲染炸掉——哪怕其余几天完好。
                     */
                    const usable = (days as Array<BgmCalendarDay>).filter(
                        isUsableCalendarDay
                    );
                    caches.calendar.set(BANGUMI_CALENDAR, usable);
                    return usable;
                } finally {
                    /* 在请求结算的同时清槽，顺序调用不被误复用。 */
                    pendingCalendar = undefined;
                }
            })();
            pendingCalendar = request;
            return request;
        },
    };
}

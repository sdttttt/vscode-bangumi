import { getJson } from "../http";
import type { RequestCaches } from "../cache";
import { BANGUMI_CALENDAR } from "./query";
import { isValidCalendar, type BgmCalendarDay } from "./schema";

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
 * 创建一次扩展会话的 Bangumi 接口。
 *
 * 失败时只返回 `undefined`，不在这里弹提示：调用方可能正在重试，也可能已经
 * 回退到另一个来源，提示应当由最终决定「怎么展示」的一层负责。
 *
 * @param caches 由组合根持有的会话缓存
 * @author sdttttt
 */
export function createBgmTvApi(caches: RequestCaches): BgmTvApi {
    return {
        getCalendar: async () => {
            const cached = caches.calendar.get(BANGUMI_CALENDAR);
            if (cached) {
                return cached;
            }

            let days: unknown;
            try {
                days = await getJson<unknown>(BANGUMI_CALENDAR);
            } catch {
                /* 网络失败按「没有数据」上报，视图会回退或展示不可用。 */
                return;
            }

            if (!isValidCalendar(days)) {
                return;
            }

            caches.calendar.set(BANGUMI_CALENDAR, days);
            return days;
        },
    };
}

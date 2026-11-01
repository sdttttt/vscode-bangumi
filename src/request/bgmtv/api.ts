import type { Notifier } from "../../notifier";
import { getJson } from "../http";
import type { RequestCaches } from "../cache";
import { BANGUMI_CALENDAR } from "./query";
import { isValidCalendar, type BgmCalendarDay } from "./schema";

/**
 * 无法拉取 Bangumi 放送表时展示的消息。
 *
 * 单独一条，不复用 B 站故障的文案：出问题的并不是同一个服务。
 *
 * @author sdttttt
 */
const MISSING_CALENDAR_MESSAGE = "咦？没有找到 Bangumi 的放送表……";

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
 * @param caches 由组合根持有的会话缓存
 * @param notifier 会话面向用户的输出
 * @author sdttttt
 */
export function createBgmTvApi(
    caches: RequestCaches,
    notifier: Notifier
): BgmTvApi {
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
                /* 网络失败按「没有数据」上报，视图会回退到空态。 */
                notifier.info(MISSING_CALENDAR_MESSAGE);
                return;
            }

            if (!isValidCalendar(days)) {
                notifier.info(MISSING_CALENDAR_MESSAGE);
                return;
            }

            caches.calendar.set(BANGUMI_CALENDAR, days);
            return days;
        },
    };
}

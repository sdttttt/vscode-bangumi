import type { ScheduleEvent } from "./schedule";

/**
 * 剩余时间低于该值的事件按「已更新」播报。
 *
 * @author sdttttt
 */
export const PUBLISHED_THRESHOLD_MS = 60_000;

/**
 * 到期事件需要告知用户的内容。
 *
 * @author sdttttt
 */
export type Notice =
    | { readonly kind: "published" }
    | { readonly kind: "ahead"; readonly minutes: number };

/**
 * 判断到期事件应当发出哪种通知。
 *
 * 纯函数，因此阈值与剩余时间取整都能由单元测试覆盖，无需伪造编辑器。
 *
 * @author sdttttt
 */
export function describeNotice(event: ScheduleEvent, now: number): Notice {
    const remain = event.pubTs - now;

    if (PUBLISHED_THRESHOLD_MS >= remain) {
        return { kind: "published" };
    }

    return { kind: "ahead", minutes: Math.ceil(remain / 60_000) };
}

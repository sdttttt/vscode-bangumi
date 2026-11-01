import { describeTitles } from "./titles";

/**
 * 提醒的标题：单个剧名，或某个更新分组的全部剧名。
 *
 * @author sdttttt
 */
export type RemindTitles = string | ReadonlyArray<string>;

/**
 * 提醒中操作按钮的文案。
 *
 * @author sdttttt
 */
export const REMIND_ACTION = "打开周番表";

/**
 * 提醒中「不再提醒」按钮的文案。
 *
 * 按下后更新提醒会关闭，状态栏条目仍然保留。
 *
 * @author sdttttt
 */
export const REMIND_MUTE_ACTION = "不再提醒";

/**
 * 通过共用的通知格式化器渲染标题。
 *
 * @author sdttttt
 */
function formatTitles(titles: RemindTitles): string {
    return "string" === typeof titles
        ? describeTitles([titles])
        : describeTitles(titles);
}

/**
 * 剧集已更新的提醒文案。
 *
 * @author sdttttt
 */
export function updatedMessage(titles: RemindTitles): string {
    return `${formatTitles(titles)} 更新啦！`;
}

/**
 * 剧集即将更新的提醒文案。
 *
 * @author sdttttt
 */
export function upcomingMessage(
    titles: RemindTitles,
    minuteTime: string | number
): string {
    return `${formatTitles(titles)} 还有${minuteTime}分钟就更新啦！`;
}

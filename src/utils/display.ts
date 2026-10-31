import { describeTitles } from "./titles";

/**
 * Titles of a reminder: either one title, or every season of an update group.
 *
 * @author sdttttt
 */
export type RemindTitles = string | ReadonlyArray<string>;

/**
 * Label of the action button of a reminder.
 *
 * @author sdttttt
 */
export const REMIND_ACTION = "打开周番表";

/**
 * Renders the titles through the shared notification formatter.
 *
 * @author sdttttt
 */
function formatTitles(titles: RemindTitles): string {
    return "string" === typeof titles
        ? describeTitles([titles])
        : describeTitles(titles);
}

/**
 * Message of a reminder that an episode is out.
 *
 * @author sdttttt
 */
export function updatedMessage(titles: RemindTitles): string {
    return `${formatTitles(titles)} 更新啦！`;
}

/**
 * Message of a reminder that an episode is about to be out.
 *
 * @author sdttttt
 */
export function upcomingMessage(
    titles: RemindTitles,
    minuteTime: string | number
): string {
    return `${formatTitles(titles)} 还有${minuteTime}分钟就更新啦！`;
}

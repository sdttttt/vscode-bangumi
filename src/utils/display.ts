import { window, commands } from "vscode";
import { describeTitles } from "./titles";

/**
 * Titles of a reminder: either one title, or every season of an update group.
 *
 * @author sdttttt
 */
export type RemindTitles = string | ReadonlyArray<string>;

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
 * show Remind.
 *
 * @param {string} content
 * @author sdttttt
 */
function showRemind(content: string): void {
    window
        .showInformationMessage(content, "Open WeekBangumi")
        .then((result: string | undefined) => {
            if (result) {
                /* The host owns the command, so a failure is not actionable. */
                commands
                    .executeCommand("weekBangumi")
                    .then(undefined, () => undefined);
            }
        });
}

export function showBeforeBangumiUpdateRemind(
    content: RemindTitles,
    minuteTime: string | number
): void {
    showRemind(`${formatTitles(content)} 还有${minuteTime}分钟就更新啦！`);
}

export function showBangumiUpdateRemind(content: RemindTitles): void {
    showRemind(`${formatTitles(content)} 更新啦！`);
}

import {
    window, commands
} from "vscode";

/**
 * show Remind.
 *
 * @param {string} bangumiName
 * @author sdttttt
 */
function showRemind(content: string): void
{
    window
        .showInformationMessage(content, "Open WeekBangumi")
        .then((result: string | undefined) =>
        {
            if (result)
            {
                commands.executeCommand("weekBangumi");
            }
        });
}

export function showBeforeBangumiUpdateRemind(
    content: string,
    minuteTime: string | number
): void
{
    showRemind(`《${content}》 还有${minuteTime}分钟就更新啦！ 🎉`);
}

export function showBangumiUpdateRemind(content: string): void
{
    showRemind(`《${content}》 更新啦！🎉`);
}

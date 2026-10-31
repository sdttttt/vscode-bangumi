import { StatusBarAlignment, window, type StatusBarItem } from "vscode";
import { dayMarker, describeEvent } from "./schedule";
import type { ScheduleEvent } from "./schedule";
import { listTitles } from "../utils/titles";

/**
 * Number of upcoming events listed in the status bar tooltip.
 *
 * @author sdttttt
 */
const TOOLTIP_EVENTS = 3;

/**
 * The status bar entry of the reminder.
 *
 * @author sdttttt
 */
export interface StatusBar {
    /** Shows the first upcoming event, or hides the entry when none is left. */
    show(upcoming: ReadonlyArray<ScheduleEvent>, now: number): void;
    /** Hides the entry, keeping it for the next schedule. */
    hide(): void;
    /** Releases the entry. */
    dispose(): void;
}

/**
 * Creates the status bar entry of the reminder.
 *
 * The item is created lazily, so creating the reminder never touches the editor
 * UI, and it is released together with the reminder.
 *
 * @param command command run when the entry is clicked
 * @author sdttttt
 */
export function useStatusBar(command: string): StatusBar {
    let item: StatusBarItem | undefined;
    let visible = false;

    const ensureItem = (): StatusBarItem => {
        if (!item) {
            item = window.createStatusBarItem(StatusBarAlignment.Right, 100);
            item.name = "Bangumi Open";
            item.command = command;
        }
        return item;
    };

    const hide = (): void => {
        if (!item) {
            return;
        }
        item.hide();
        visible = false;
    };

    /**
     * Full titles and times of the next events. The status bar truncates, the
     * tooltip never does.
     */
    const buildTooltip = (
        next: ScheduleEvent,
        rest: ReadonlyArray<ScheduleEvent>,
        now: number
    ): string =>
        [next, ...rest.slice(0, TOOLTIP_EVENTS - 1)]
            .map(
                event =>
                    `${dayMarker(event, now)}${event.pubTime} ${listTitles(event.titles)}`
            )
            .join("\n");

    return {
        show: (upcoming, now) => {
            const next = upcoming[0];
            if (!next) {
                hide();
                return;
            }

            const bar = ensureItem();
            bar.text = describeEvent(next, now);
            bar.tooltip = buildTooltip(next, upcoming.slice(1), now);
            bar.accessibilityInformation = {
                label: `${listTitles(next.titles)} 将于 ${dayMarker(next, now)}${next.pubTime} 更新`,
            };

            if (!visible) {
                bar.show();
                visible = true;
            }
        },
        hide,
        dispose: () => {
            item?.dispose();
            item = undefined;
            visible = false;
        },
    };
}

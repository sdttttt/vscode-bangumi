import {
    StatusBarAlignment,
    StatusBarItem,
    window,
    type Disposable,
} from "vscode";
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
 * Owns the status bar entry of the reminder.
 *
 * The item is created lazily, so importing this module never touches the
 * editor UI, and it is released together with the reminder.
 *
 * @author sdttttt
 */
export class ReminderStatusBar implements Disposable {
    private item: StatusBarItem | undefined;

    private visible = false;

    public constructor(private readonly command: string) {}

    /**
     * Shows the first upcoming event, or hides the entry when none is left.
     *
     * @author sdttttt
     */
    public show(upcoming: ReadonlyArray<ScheduleEvent>, now: number): void {
        const next = upcoming[0];
        if (!next) {
            this.hide();
            return;
        }

        const item = this.ensureItem();
        item.text = describeEvent(next, now);
        item.tooltip = this.buildTooltip(next, upcoming.slice(1), now);
        item.accessibilityInformation = {
            label: `${listTitles(next.titles)} 将于 ${dayMarker(next, now)}${next.pubTime} 更新`,
        };

        if (!this.visible) {
            item.show();
            this.visible = true;
        }
    }

    /**
     * Hides the entry, keeping the instance for the next schedule.
     *
     * @author sdttttt
     */
    public hide(): void {
        if (!this.item) {
            return;
        }
        this.item.hide();
        this.visible = false;
    }

    /**
     * Releases the entry.
     *
     * @author sdttttt
     */
    public dispose(): void {
        this.item?.dispose();
        this.item = undefined;
        this.visible = false;
    }

    private ensureItem(): StatusBarItem {
        if (!this.item) {
            this.item = window.createStatusBarItem(
                StatusBarAlignment.Right,
                100
            );
            this.item.name = "Bangumi Open";
            this.item.command = this.command;
        }
        return this.item;
    }

    /**
     * Full titles and times of the next events. The status bar truncates, the
     * tooltip never does.
     *
     * @author sdttttt
     */
    private buildTooltip(
        next: ScheduleEvent,
        rest: ReadonlyArray<ScheduleEvent>,
        now: number
    ): string {
        return [next, ...rest.slice(0, TOOLTIP_EVENTS - 1)]
            .map(
                event =>
                    `${dayMarker(event, now)}${event.pubTime} ${listTitles(event.titles)}`
            )
            .join("\n");
    }
}

/// <reference types="node" />
/// <reference types="mocha" />
import { StatusBarItem } from "vscode";
import { WBangumi } from "./request/structure";
declare const _default: {
    remindTimers: Array<NodeJS.Timeout>;
    statusBar: StatusBarItem;
    /**
     * Reminders bangumi update
     *
     * @returns {Promise}
     * @async
     */
    enableBangumiUpdateReminder(): Promise<void>;
    /**
     * Make a Reminder to ReminderGroup.
     *
     * @private
     */
    makeReminder(currentTime: number, aheadTime: number, bangumi: WBangumi): void;
    /**
     * Status handler.
     */
    statusHandle(currentTime: number, aheadTime: number, bangumisTimeGroup: WBangumi[][]): void;
    /**
     * @param bangumis - this Bangumi Array update time same.
     */
    updateStatusBar(bangumis: WBangumi[] | undefined): void;
    updateStatusBarContent(content: string): void;
    /**
     * Destroy reminder
     */
    destroyReminder(): void;
};
export default _default;

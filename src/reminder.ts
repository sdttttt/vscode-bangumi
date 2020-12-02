import { getWeekBangumi } from "./request/bangumi";
import * as vscode from "vscode";
import { WeekBangumiData, WBangumi } from "./request/structure";
import { isEmptyArray } from "./utils/type";
import { getReminderAheadTime } from "./configuration";
import { showRemind } from "./utils/display";
import {
	currentTimestamp,
	getTodayIndexInWeekBangumi,
	toMinuteFromSecode,
} from "./utils/strings";

export default new (class Reminder {

  private remindTimers: Array<NodeJS.Timeout> = [];

  /**
	 * Reminders bangumi update
	 *
	 * @returns
	 * @async
	 * @author sdttttt
	 */
	async enableBangumiUpdateReminder(): Promise<void> {
		const bangumisData:
			| Array<WeekBangumiData>
			| undefined = await getWeekBangumi();

		if (!bangumisData) {
			return;
		}

		const todayIndex: number | undefined = getTodayIndexInWeekBangumi(
			bangumisData
		);
		if (!todayIndex) {
			vscode.window.showInformationMessage("没有找到今日的索引 ??");
			return;
		}

		const currentTime: number = currentTimestamp();
		const aheadTime: number = getReminderAheadTime();

		for (let i = todayIndex; i <= todayIndex + 1; i++) {
			for (const bangumi of bangumisData[i].seasons) {
				this.makeReminder(currentTime, aheadTime, bangumi);
			}
		}
	}

	/**
	 * Make a Reminder to ReminderGroup.
	 *
	 * @private
	 * @param {WBangumi} bangumi
	 * @author sdttttt
	 */
	private makeReminder(
		currentTime: number,
		aheadTime: number,
		bangumi: WBangumi
	): void {
		const bangumiTime: number = bangumi.pub_ts * 1000;
		if (currentTime < bangumiTime && bangumi.delay !== 1) {
			const timeDifference: number = bangumiTime - currentTime;
			const timer: NodeJS.Timeout = this.makeTimer(
				bangumi.title,
				timeDifference,
				aheadTime
			);

			this.remindTimers.push(timer);
		}
	}

	/**
	 * Makes remind
	 *
	 * @param bangumiName
	 * @param time
	 * @returns remind
	 * @author sdttttt
	 */
	private makeTimer(
		bangumiName: string,
		timeDifference: number,
		aheadTime: number
	): NodeJS.Timeout {
		const aheadTimeM: number = aheadTime * 1000;

		return setTimeout(async () => {
			if (aheadTime === 0) {
				showRemind(`《${bangumiName}》 更新啦！🎉`);
			} else {
				const minute = toMinuteFromSecode(aheadTime);
				showRemind(`《${bangumiName}》 还有${minute}分钟就更新啦！ 🎉`);
			}
		}, timeDifference - aheadTimeM);
	}

	/**
	 * Destroy reminder
	 *
	 * @author sdttttt
	 */
	destroyReminder(): void {
		if (!isEmptyArray(this.remindTimers)) {
			this.remindTimers.forEach((timer: NodeJS.Timeout) => {
				clearTimeout(timer);
			});
			this.remindTimers = [];
		}
	}
})();

import { getWeekBangumi } from "./request/bangumi";
import { window, StatusBarItem, StatusBarAlignment } from "vscode";
import { WeekBangumiData, WBangumi } from "./request/structure";
import { isEmptyArray } from "./utils/type";
import { getReminderAheadTime, isDisplayStatusBar } from "./configuration";
import {
	showBangumiUpdateRemind,
	showBeforeBangumiUpdateRemind,
} from "./utils/display";
import {
	currentTimestamp,
	getTodayIndexInWeekBangumi,
	toMinuteFromSecode,
} from "./utils/strings";

export default new (class Reminder {
	private remindTimers: Array<NodeJS.Timeout> = [];

	private statusBar: StatusBarItem = window.createStatusBarItem(
		StatusBarAlignment.Right
	);

	constructor() {
		// this.statusBar.color = "#FFC0CB";
		this.statusBar.command = "weekBangumi";
		this.statusBar.text = "";
		if (isDisplayStatusBar()) {
			this.statusBar.show();
		} else {
			this.statusBar.hide();
		}
	}

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
			window.showInformationMessage("没有找到今日的索引 ??");
			return;
		}

		const currentTime: number = currentTimestamp();
		const aheadTime: number = getReminderAheadTime();

		for (let i = todayIndex; i <= todayIndex + 1; i++) {
			const bangumiSize = bangumisData[i].seasons.length;
			for (let k = 0; k < bangumiSize; k++) {
				const bangumi: WBangumi = bangumisData[i].seasons[k];
				const nextBangumi: WBangumi | undefined =
					k + 1 < bangumiSize
						? bangumisData[i].seasons[k + 1]
						: undefined;
				this.makeReminder(currentTime, aheadTime, bangumi, nextBangumi);
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
		bangumi: WBangumi,
		nextBangumi: WBangumi | undefined
	): void {
		const bangumiTime: number = bangumi.pub_ts * 1000;
		if (currentTime < bangumiTime && bangumi.delay !== 1) {
			const timeDifference: number = bangumiTime - currentTime;
			const aheadTimeM = aheadTime * 1000;
			const timer: NodeJS.Timeout = setTimeout(async () => {
				if (aheadTime === 0) {
					showBangumiUpdateRemind(bangumi.title);
				} else {
					const minute = toMinuteFromSecode(aheadTime);
					showBeforeBangumiUpdateRemind(bangumi.title, minute);
				}
				this.updateStatusBar(nextBangumi);
			}, timeDifference - aheadTimeM);

			// if true: statusBar is not display NextBangumi Information.
			if (this.statusBar.text.trim().length === 0) {
				this.updateStatusBar(bangumi);
			}
			this.remindTimers.push(timer);
		}
	}

	private updateStatusBar(bangumi: WBangumi | undefined) {
		if (bangumi) {
			const { title, pub_time: targetTime } = bangumi;
			const shortTitle =
				title.length > 7 ? `${title.slice(0, 7)}...` : title;
			this.updateStatusBarContent(
				`《${shortTitle.trim()}》update at ${targetTime} ⏰`
			);
		} else {
			this.updateStatusBarContent("番剧暂时没有了诶");
		}
	}

	private updateStatusBarContent(content: string): void {
		this.statusBar.text = content;
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

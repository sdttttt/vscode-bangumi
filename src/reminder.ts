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
	getFromIndexSameUpdateBangumi,
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
	 * @returns {Promise}
	 * @async
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

			// 制作定时器
			for (let k = 0; k < bangumiSize; k++) {
				const bangumi: WBangumi = bangumisData[i].seasons[k];
				this.makeReminder(currentTime, aheadTime, bangumi);
			}

			// 制作状态栏
			for (let k = 0; k < bangumiSize; k++) {
				const bangumis: WBangumi[] = getFromIndexSameUpdateBangumi(
					bangumisData[i].seasons,
					k
				);

				if (bangumis.length === 0) break;
				this.makeStatus(currentTime, aheadTime, bangumis);
				k += bangumis.length;
			}
		}
	}

	/**
	 * Make a Reminder to ReminderGroup.
	 *
	 * @private
	 */
	private makeReminder(
		currentTime: number,
		aheadTime: number,
		bangumi: WBangumi
	): void {
		const bangumiTime: number = bangumi.pub_ts * 1000;
		if (currentTime < bangumiTime && bangumi.delay !== 1) {
			const timeDifference = bangumiTime - currentTime;
			const aheadTimeM = aheadTime * 1000;
			const timer: NodeJS.Timeout = setTimeout(async () => {
				if (aheadTime === 0) {
					showBangumiUpdateRemind(bangumi.title);
				} else {
					const minute = toMinuteFromSecode(aheadTime);
					showBeforeBangumiUpdateRemind(bangumi.title, minute);
				}
			}, timeDifference - aheadTimeM);

			this.remindTimers.push(timer);
		}
	}

	/**
	 * Make Status Timer.
	 *
	 * @private
	 */
	private makeStatus(
		currentTime: number,
		aheadTime: number,
		bangumis: WBangumi[]
	): void {
		const bangumiTime: number = bangumis[0].pub_ts * 1000;
		if (currentTime < bangumiTime) {
			const timeDifference = bangumiTime - currentTime;
			const aheadTimeM = aheadTime * 1000;
			const timer: NodeJS.Timeout = setTimeout(async () => {
				this.updateStatusBar(bangumis);
			}, timeDifference - aheadTimeM);

			// if true: statusBar is not display NextBangumi Information.
			if (this.statusBar.text.trim().length === 0) {
				this.updateStatusBar(bangumis);
			}
			this.remindTimers.push(timer);
		}
	}

	private updateStatusBar(bangumis: WBangumi[]) {
		if (bangumis.length !== 0) {
			if (bangumis.length === 1) {
				const { title, pub_time: targetTime } = bangumis[0];
				const shortTitle =
					title.length > 7 ? `${title.slice(0, 7)}...` : title;
				this.updateStatusBarContent(
					`《${shortTitle.trim()}》update at ${targetTime} ⏰`
				);
			} else {
				const { pub_time: targetTime } = bangumis[0];
				const bangumiCount = bangumis.length;
				this.updateStatusBarContent(
					`有${bangumiCount}部番 update at ${targetTime} ⏰`
				);
			}
		} else {
			this.updateStatusBarContent("番剧暂时没有了诶");
		}
	}

	private updateStatusBarContent(content: string): void {
		this.statusBar.text = content;
	}

	/**
	 * Destroy reminder
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

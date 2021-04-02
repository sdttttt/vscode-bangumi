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
		// 提前时间
		const aheadTime: number = getReminderAheadTime();

		// 内部结构其实就是相同更新时间的番剧一组, 分多组.
		const bangumiTimeGroups: Array<WBangumi[]> = [];

		for (let i = todayIndex; i <= todayIndex + 1; i++) {
			const bangumiSize = bangumisData[i].seasons.length;

			// 制作定时器
			for (let k = 0; k < bangumiSize; k++) {
				const bangumi: WBangumi = bangumisData[i].seasons[k];
				this.makeReminder(currentTime, aheadTime, bangumi);
			}

			// 根据更新时间将番剧分组
			for (let k = 0; k < bangumiSize; ) {
				const bangumis: WBangumi[] = getFromIndexSameUpdateBangumi(
					bangumisData[i].seasons,
					k
				);
				bangumiTimeGroups.push(bangumis.filter(v => v.delay !== 1));
				k += bangumis.length;
			}
		}

		this.statusHandle(currentTime, aheadTime, bangumiTimeGroups);
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
	 * Status handler.
	 */
	private statusHandle(
		currentTime: number,
		aheadTime: number,
		bangumisTimeGroup: WBangumi[][]
	): void {
		for (let i = 0; i < bangumisTimeGroup.length; i++) {

			const bangumiTime: number = bangumisTimeGroup[i].length !== 0 ? bangumisTimeGroup[i][0].pub_ts * 1000 : 0;

			if (currentTime < bangumiTime) {
				const timeDifference = bangumiTime - currentTime;
				const aheadTimeM = aheadTime * 1000;

				// if true: statusBar is not display NextBangumi Information.
				if (this.statusBar.text.trim().length === 0) {
					this.updateStatusBar(bangumisTimeGroup[i]);
				}

				const timer: NodeJS.Timeout = setTimeout(
					/**
					 * 为什么这里的 i 要加 1 呢:
					 * 状态栏的显示的永远是下一部番剧的更新时间
					 *
					 * 所以下一个定时器里在还没触发的时候,
					 * 里面存放的是下下部番剧的更新时间.
					 * 触发的时间是下部番剧更新的时间.
					 * 								听懂了🐎?
					 * 						什么?!你没听懂? 多看几遍?
					 */
					async () => this.updateStatusBar(bangumisTimeGroup[i + 1]),
					timeDifference - aheadTimeM
				);

				this.remindTimers.push(timer);
			}
		}
	}

	/**
	 * @param bangumis - this Bangumi Array update time same.
	 */
	private updateStatusBar(bangumis: WBangumi[] | undefined) {
		if (bangumis && bangumis.length !== 0) {
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
					`很神秘, 有${bangumiCount}部番 update at ${targetTime} ⏰`
				);
			}
			
		} else {
			this.updateStatusBarContent("番剧暂时没有了诶, 蛮怪的.");
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

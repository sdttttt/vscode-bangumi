import { getWeekBangumi } from "./request/bangumi";
import { window, StatusBarItem, StatusBarAlignment } from "vscode";
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

	private statusBar: StatusBarItem = window.createStatusBarItem(
		StatusBarAlignment.Right
	);

  constructor() {
    this.statusBar.color = "#FFC0CB";
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
        const nextBangumi: WBangumi | undefined = (k + 1) < bangumiSize ? bangumisData[i].seasons[k + 1] : undefined;
        this.makeReminder(currentTime, aheadTime, bangumi, nextBangumi);
			}
    }
    this.updateStatusBar(bangumisData[todayIndex].seasons[0]);
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
					showRemind(`《${bangumi.title}》 更新啦！🎉`);
				} else {
					const minute = toMinuteFromSecode(aheadTime);
					showRemind(
						`《${bangumi.title}》 还有${minute}分钟就更新啦！ 🎉`
					);
        }
        this.updateStatusBar(nextBangumi);
			}, timeDifference - aheadTimeM);
			this.remindTimers.push(timer);
		}
	}

  private updateStatusBar(bangumi: WBangumi | undefined) {
    if (bangumi) {
      const { title, pub_time: targetTime } = bangumi;
      const shortTitle = title.length > 7 ? `${title.slice(0, 7)}...` : title;
      this.statusBar.text = `《${shortTitle}》在 ${targetTime} 更新噢⌛`;
    } else {
      this.statusBar.text = "番剧暂时没有了诶"
    }
    this.statusBar.show();
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

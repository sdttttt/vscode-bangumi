import { WBangumi, WeekBangumiData } from "../request/structure";
import { toNumber } from "./type";

/**
 * To week day
 *
 * @param {number} day
 * @returns week day
 * @author sdttttt
 */
export function toWeekDay(day: number): string {
	switch (day) {
		case 1:
			return "星期一";
		case 2:
			return "星期二";
		case 3:
			return "星期三";
		case 4:
			return "星期四";
		case 5:
			return "星期五";
		case 6:
			return "星期六";
		case 7:
			return "星期日";
		default:
			return "";
	}
}

/**
 * To judge whether it is today or not.
 *
 * @return {string}
 * @export
 * @author sdttttt
 */
export function isToday(day: string): boolean {
	const currentTime: Date = new Date();
	const today = currentTime.getMonth() + 1 + "-" + currentTime.getDate();
	return today === day;
}

/**
 * Currents timestamp
 *
 * @returns timestamp
 * @export
 * @author sdttttt
 */
export function currentTimestamp(): number {
	return Number(new Date());
}

/**
 * Gets today index in week bangumi
 *
 * @param bangumis
 * @returns today index in week bangumi
 * @export
 * @author sdttttt
 */
export function getTodayIndexInWeekBangumi(
	bangumis: Array<WeekBangumiData>
): number | undefined {
	for (let i = 0; i < bangumis.length; i++) {
		if (isToday(bangumis[i].date)) {
			return i;
		}
	}
}

/**
 * Gets Form Index start Same time update Bangumi.
 *
 * @param bangumis 
 * @param index 
 * @returns
 */
export function getFromIndexSameUpdateBangumi(
	bangumis: WBangumi[],
	index: number
): WBangumi[] {
	const currentDate = bangumis[index].pub_time;
	const result: WBangumi[] = [];

	for (let i = index; i < bangumis.length; i++) {
		if (bangumis[i].pub_time === currentDate) result.push(bangumis[i]);
		else break;
	}

	// 最后过滤拖更的番剧
	return result.filter(v => v.delay !== 1);
}

/**
 * To minute from secode
 *
 * @param {number} time
 * @returns {number} minute from secode
 * @author sdttttt
 */
export function toMinuteFromSecode(time: number): number {
	return Math.ceil(time / 60);
}

/**
 * Numbers of string plus
 *
 * @param str
 * @param num
 * @returns of string plus
 * @author sdttttt
 */
export function numberOfStringPlus(str: string, num: number): string {
	return (toNumber(str) + num).toString();
}

/**
 *	return Number of Random Integer.
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @author sdttttt
 */
export function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

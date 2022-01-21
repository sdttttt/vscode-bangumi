import { WBangumi, WeekBangumiData } from "../request/structure";
/**
 * To week day
 *
 * @param {number} day
 * @returns week day
 * @author sdttttt
 */
export declare function toWeekDay(day: number): string;
/**
 * To judge whether it is today or not.
 *
 * @return {string}
 * @export
 * @author sdttttt
 */
export declare function isToday(day: string): boolean;
/**
 * Currents timestamp
 *
 * @returns timestamp
 * @export
 * @author sdttttt
 */
export declare function currentTimestamp(): number;
/**
 * Gets today index in week bangumi
 *
 * @param bangumis
 * @returns today index in week bangumi
 * @export
 * @author sdttttt
 */
export declare function getTodayIndexInWeekBangumi(bangumis: Array<WeekBangumiData>): number | undefined;
/**
 * Gets Form Index start Same time update Bangumi.
 *
 * @param bangumis
 * @param index
 * @returns
 */
export declare function getFromIndexSameUpdateBangumi(bangumis: WBangumi[], index: number): WBangumi[];
/**
 * To minute from secode
 *
 * @param {number} time
 * @returns {number} minute from secode
 * @author sdttttt
 */
export declare function toMinuteFromSecode(time: number): number;
/**
 * Numbers of string plus
 *
 * @param str
 * @param num
 * @returns of string plus
 * @author sdttttt
 */
export declare function numberOfStringPlus(str: string, num: number): string;
/**
 *	return Number of Random Integer.
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @author sdttttt
 */
export declare function randomInteger(min: number, max: number): number;

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

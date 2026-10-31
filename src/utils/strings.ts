import { toNumber } from "./type";

/**
 * 把星期序号转换为中文星期名。
 *
 * @param day 星期序号，1 为周一，7 为周日
 * @returns 中文星期名，序号越界时返回空串
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
 * 把字符串解析为数字后加上给定值，再转回字符串。
 *
 * @param str 数字字符串
 * @param num 要加上的值
 * @returns 相加结果的字符串形式
 * @author sdttttt
 */
export function numberOfStringPlus(str: string, num: number): string {
    return (toNumber(str) + num).toString();
}

/**
 * 返回区间内的随机整数。
 *
 * @export
 * @param min 下界（含）
 * @param max 上界（不含）
 * @returns 随机整数
 * @author sdttttt
 */
export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

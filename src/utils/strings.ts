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

/**
 * 把 `http://` 地址升级为 `https://`。
 *
 * Bangumi 接口返回的封面与页面地址都是明文 http：http 资源会触发混合内容拦截，
 * 而 Webview 的内容安全策略也只放行 https 图片。其余内容原样返回。
 *
 * @param url 原始地址
 * @returns 升级后的地址；空值时返回空串
 * @author sdttttt
 */
export function toHttpsUrl(url: string | null | undefined): string {
    if (!url) {
        return "";
    }

    return url.replace(/^http:\/\//i, "https://");
}

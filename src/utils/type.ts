/**
 * 把可能为空的文本转换为数字。
 *
 * @export
 * @param text 待转换的文本
 * @returns 转换结果，无法解析时返回 0
 *
 * @author sdttttt
 */
export function toNumber(text: string | undefined): number {
    if (text === undefined) {
        return 0;
    }

    if ("string" === typeof text) {
        const number = Number(text);
        if (!isNaN(number)) {
            return number;
        }
    }

    return 0;
}

/**
 * 判断数组是否为空。
 *
 * @param array 待判断的数组
 * @returns 空数组或未定义时返回 true
 *
 * @author sdttttt
 */
export function isEmptyArray(array: Array<unknown>): boolean {
    return array === undefined || 0 === array.length;
}

/**
 * 判断对象是否为空。
 *
 * @param obj 待判断的对象
 * @returns 空对象时返回 true
 *
 * @author sdttttt
 */
export function isEmptyObject(obj: unknown): boolean {
    return "{}" === JSON.stringify(obj);
}

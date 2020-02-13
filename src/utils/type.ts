/**
 * Detroit: Become Number
 *
 * @export
 * @param {(string | undefined)} text
 * @returns {number}
 *
 * @author sdttttt
 */
export function toNumber(text: string | undefined): number {

    if (text === undefined) {
        return 0;
    }

    if (typeof text === "string") {
        const number = Number(text);
        if (!isNaN(number)) {
            return number;
        }
    }

    return 0;
}


export function isEmptyArray(array: Array<any>): boolean {
    return array.length === 0;
}

export function isEmptyObject(obj: any): boolean {
    return JSON.stringify(obj) === "{}";
}
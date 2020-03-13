"use strict";

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

/**
 * Determines whether empty array is
 *
 * @param {Array<any>} array
 * @returns true if empty array
 *
 * @author sdttttt
 */
export function isEmptyArray(array: Array<unknown>): boolean {
	return array === undefined || array.length === 0;
}

/**
 * Determines whether empty object is
 *
 * @param {any} obj
 * @returns true if empty object
 *
 * @author sdttttt
 */
export function isEmptyObject(obj: unknown): boolean {
	return JSON.stringify(obj) === "{}";
}
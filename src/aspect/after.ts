/**
 * After Aspect
 *
 * @param args
 * @author sdttttt
 */
export function after(...args: Array<() => void>): Function {
	return function (): void {
		for (const callback of args) {
			callback();
		}
	};
}

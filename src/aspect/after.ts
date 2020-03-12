import * as vscode from 'vscode';

/**
 * After Aspect
 *
 * @param args
 * @author sdttttt
 */
export function after(...args: Array<() => void>) {
    return function (target: any , propertyKey: string, descriptor: PropertyDescriptor) {
        for (const callback of args) {
            callback();
        }
    };
}

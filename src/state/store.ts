/**
 * 最小状态容器。
 *
 * 扩展里所有可变状态都收敛为这一个容器，整个会话的状态因此集中在一处，
 * 不重新加载持有它的模块也能重置。
 *
 * @author sdttttt
 */
export interface Store<T> {
    /** 当前状态。请把返回值视为不可变。 */
    get(): T;
    /** 替换状态。 */
    set(next: T): void;
    /** 用纯变换的结果替换状态。 */
    update(updater: (state: T) => T): void;
    /** 恢复初始状态。 */
    reset(): void;
}

/**
 * 围绕初始状态创建一个 store。
 *
 * @param initial store 的起始状态，也是 `reset()` 回到的状态
 * @author sdttttt
 */
export function createStore<T>(initial: T): Store<T> {
    let state = initial;

    return {
        get: () => state,
        set: next => {
            state = next;
        },
        update: updater => {
            state = updater(state);
        },
        reset: () => {
            state = initial;
        },
    };
}

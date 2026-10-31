/**
 * Minimal state container.
 *
 * Everything mutable in the extension is reduced to one of these, so the state
 * of the whole session lives in a single object and can be reset without
 * reloading the module that happens to hold it.
 *
 * @author sdttttt
 */
export interface Store<T> {
    /** Current state. Treat the returned value as immutable. */
    get(): T;
    /** Replaces the state. */
    set(next: T): void;
    /** Replaces the state with the result of a pure transform. */
    update(updater: (state: T) => T): void;
    /** Restores the initial state. */
    reset(): void;
}

/**
 * Builds a store around an initial state.
 *
 * @param initial state the store starts with, and returns to on `reset()`
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

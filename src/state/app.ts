import { createStore } from "./store";
import { DEFAULT_QUERY, type BangumiQuery } from "../request/query";

/**
 * Everything the extension remembers between commands.
 *
 * The bangumi list page lives outside the query because paging must survive a
 * filter change: selecting a tag, or restoring the defaults, keeps the current
 * page instead of silently jumping back to the first one.
 *
 * @author sdttttt
 */
export interface AppState {
    readonly query: BangumiQuery;
    readonly page: number;
    /** Filters chosen through the index lists, keyed by list tag. */
    readonly tags: ReadonlyMap<string, string>;
}

/**
 * The state a fresh session starts with.
 *
 * @author sdttttt
 */
export function initialState(): AppState {
    return { query: DEFAULT_QUERY, page: 1, tags: new Map() };
}

/**
 * Merges a subset of the filters into the query.
 *
 * @author sdttttt
 */
export function applyQuery(
    state: AppState,
    patch: Partial<BangumiQuery>
): AppState {
    return { ...state, query: { ...state.query, ...patch } };
}

/**
 * Adds or replaces one selected tag.
 *
 * @author sdttttt
 */
export function applyTag(
    state: AppState,
    tag: string,
    value: string
): AppState {
    const tags = new Map(state.tags);
    tags.set(tag, value);
    return { ...state, tags };
}

/**
 * Drops every selected tag.
 *
 * @author sdttttt
 */
export function withoutTags(state: AppState): AppState {
    return { ...state, tags: new Map() };
}

/**
 * Restores the unfiltered query.
 *
 * The page is left alone: resetting the filters must not move the user to
 * another page of the list, which is what the extension did before.
 *
 * @author sdttttt
 */
export function withoutQuery(state: AppState): AppState {
    return { ...state, query: DEFAULT_QUERY };
}

/**
 * The state of one extension session, together with the only functions allowed
 * to change it.
 *
 * @author sdttttt
 */
export interface AppStore {
    getState(): AppState;
    getQuery(): BangumiQuery;
    setQuery(patch: Partial<BangumiQuery>): void;
    resetQuery(): void;
    getPage(): number;
    setPage(page: number): void;
    getTags(): ReadonlyMap<string, string>;
    recordTag(tag: string, value: string): void;
    clearTags(): void;
    /** Restores the state of a fresh session. */
    reset(): void;
}

/**
 * Creates the state of one extension session.
 *
 * The store lives in this closure instead of the module, so a session — or a
 * test — gets its own state and can drop it by letting the value go.
 *
 * @param initial state the session starts with and returns to on `reset()`
 * @author sdttttt
 */
export function useAppState(initial: AppState = initialState()): AppStore {
    const store = createStore<AppState>(initial);

    return {
        getState: store.get,
        getQuery: () => store.get().query,
        setQuery: patch => store.update(state => applyQuery(state, patch)),
        resetQuery: () => store.update(withoutQuery),
        getPage: () => store.get().page,
        setPage: page => store.update(state => ({ ...state, page })),
        getTags: () => store.get().tags,
        recordTag: (tag, value) =>
            store.update(state => applyTag(state, tag, value)),
        clearTags: () => store.update(withoutTags),
        reset: store.reset,
    };
}

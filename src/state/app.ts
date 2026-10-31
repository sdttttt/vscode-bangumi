import { createStore } from "./store";
import { DEFAULT_QUERY, type BangumiQuery } from "../request/query";

/**
 * 扩展在命令之间需要记住的全部内容。
 *
 * 番剧列表的页码放在 query 之外，因为翻页必须在筛选变化后保持不变：
 * 选中标签或恢复默认都应保留当前页，而不是悄悄跳回第一页。
 *
 * @author sdttttt
 */
export interface AppState {
    readonly query: BangumiQuery;
    readonly page: number;
    /** 通过索引菜单选中的筛选，按列表标签索引。 */
    readonly tags: ReadonlyMap<string, string>;
}

/**
 * 新会话的初始状态。
 *
 * @author sdttttt
 */
export function initialState(): AppState {
    return { query: DEFAULT_QUERY, page: 1, tags: new Map() };
}

/**
 * 把部分筛选合并进 query。
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
 * 添加或替换一个已选标签。
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
 * 清空所有已选标签。
 *
 * @author sdttttt
 */
export function withoutTags(state: AppState): AppState {
    return { ...state, tags: new Map() };
}

/**
 * 恢复无筛选的 query。
 *
 * 页码保持不动：重置筛选不应把用户移到列表的另一页，这也是扩展一直以来的行为。
 *
 * @author sdttttt
 */
export function withoutQuery(state: AppState): AppState {
    return { ...state, query: DEFAULT_QUERY };
}

/**
 * 一次扩展会话的状态，以及唯一允许修改它的那些函数。
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
    /** 恢复新会话的状态。 */
    reset(): void;
}

/**
 * 创建一次扩展会话的状态。
 *
 * store 存在闭包里而不是模块上，因此一个会话（或一个测试）拥有自己的状态，
 * 只要不再持有这个值就能把它丢掉。
 *
 * @param initial 会话的起始状态，也是 `reset()` 回到的状态
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

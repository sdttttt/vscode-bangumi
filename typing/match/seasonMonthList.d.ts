import { BangumiUrl } from "../request/bangumiUrl";
declare const _default: {
    readonly tag: string;
    readonly map: Map<string, string>;
    updateUrlParams(url: BangumiUrl, index: string): void;
    readonly list: string[];
    init(): void;
    conditionHandler(index: string): void;
    readonly openIndexListAfter: import("./indexList").Hooks;
    readonly openIndexListBefore: import("./indexList").Hooks;
    pushTagHook: import("./indexList").Hook;
    showTagHook(): void;
    openBangumiHook(): void;
    runHooks(hooks: import("./indexList").Hooks, index?: string | undefined): void;
    runBeforeOpenIndexListHook(index?: string | undefined): void;
    runAfterOpenIndexListHook(index?: string | undefined): void;
    openIndexList(): void;
};
export default _default;

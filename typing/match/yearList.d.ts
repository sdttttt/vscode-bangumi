declare const _default: {
    readonly tag: string;
    readonly list: Array<string>;
    encodeYear(years: Array<string>): string;
    conditionHandler(index: string): void;
    openIndexList(): void;
    readonly openIndexListAfter: import("./indexList").Hooks;
    readonly openIndexListBefore: import("./indexList").Hooks;
    pushTagHook: import("./indexList").Hook;
    showTagHook(): void;
    openBangumiHook(): void;
    runHooks(hooks: import("./indexList").Hooks, index?: string | undefined): void;
    runBeforeOpenIndexListHook(index?: string | undefined): void;
    runAfterOpenIndexListHook(index?: string | undefined): void;
};
export default _default;

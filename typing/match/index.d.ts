import { Hooks } from "./indexList";
declare const _default: {
    readonly openIndexListAfter: Hooks;
    readonly openIndexListBefore: Hooks;
    readonly list: Array<string>;
    /**
     * Hit Tag
     *
     * @author sdttttt
     */
    _tags: Map<string, string>;
    tags: Map<string, string>;
    conditionHandler(index: string): void;
    openBangumiHook(): void;
    runHooks(hooks: Hooks, index?: string | undefined): void;
    runBeforeOpenIndexListHook(index?: string | undefined): void;
    runAfterOpenIndexListHook(index?: string | undefined): void;
    openIndexList(): void;
};
/**
 *	Main List
 *
 *	@author sdttttt
 */
export default _default;

import { BangumiUrl } from "../request/bangumiUrl";
export declare type Hook = (args?: string) => void;
export declare type Hooks = Array<Hook>;
/**
 * Abstract index list
 *
 * @abstract
 * @class
 * @author sdttttt
 */
export declare abstract class AbstractIndexList {
    /**
     * List  of abstract index list
     *
     * @readonly
     * @type {Array<string>}
     */
    protected abstract readonly list: Array<string>;
    /**
     * Conditions handler
     * Running at After openIndexList
     *
     * @abstract
     * @param {string} index
     * @author sdttttt
     */
    protected abstract conditionHandler(index: string): void;
    /**
     * Hook of Open index list after
     *
     * @abstract
     * @readonly
     * @type {Hooks}
     * @author sdttttt
     */
    protected abstract readonly openIndexListAfter: Hooks;
    /**
     * Hook of Open index list before
     *
     * @abstract
     * @readonly
     * @type {Hooks}
     * @author sdttttt
     */
    protected abstract readonly openIndexListBefore: Hooks;
    /**
     * Opens bangumi hook
     *
     * @author sdttttt
     */
    protected openBangumiHook(): void;
    /**
     * Run All Hook of List.
     *
     * @private
     * @param {Hooks} hooks
     * @param {string} [index]
     * @memberof AbstractIndexList
     * @author sdttttt
     */
    private runHooks;
    /**
     * run OpenIndex Hook List.
     *
     * @memberof AbstractIndexList
     * @author sdttttt
     */
    private runBeforeOpenIndexListHook;
    /**
     * run OpenIndex Hook List
     *
     * @memberof AbstractIndexList
     * @author sdttttt
     */
    private runAfterOpenIndexListHook;
    /**
     * Opens index list
     *
     * @author sdttttt
     */
    openIndexList(): void;
}
/**
 * Final index list
 * 没有子选项的选项，它们是最后的选项，需要触发一些特殊操作
 *
 * @abstract
 * @author sdttttt
 */
export declare abstract class FinalIndexList extends AbstractIndexList {
    protected abstract readonly tag: string;
    protected readonly openIndexListAfter: Hooks;
    protected readonly openIndexListBefore: Hooks;
    constructor();
    /**
     * Push tag Hook.
     * 这里必须使用闭包来声明函数.不然会上下文丢失.
     *
     * @param {string} index
     * @author sdttttt
     */
    protected pushTagHook: Hook;
    /**
     * Shows tag hook
     *
     * @author sdttttt
     */
    private showTagHook;
}
/**
 * Simple FinalIndexList
 * FinalIndexList 的偷懒版
 * 当选中的Tag和Url所需要的值,呈现**简单的键值对应关系**.
 *  比如: "原创"Tag 只需要在
 * 继承这个抽象类可以极大的帮助你简化代码.
 *
 * @export
 * @abstract
 * @class SimpleFinalIndexList
 * @extends {FinalIndexList}
 * @author sdttttt
 */
export declare abstract class SimpleFinalIndexList extends FinalIndexList {
    protected readonly list: Array<string>;
    protected abstract readonly map: Map<string, string>;
    protected abstract updateUrlParams(url: BangumiUrl, index: string): void;
    constructor();
    /**
     *  Require Run !!
     * 它在你的子类构造函数里必须被运行!!
     *
     * @protected
     * @memberof SimpleFinalIndexList
     * @author sdttttt
     */
    protected init(): void;
    /**
     * condition Handler.
     * 一步到胃!
     *
     * @param index
     * @author sdttttt
     */
    protected conditionHandler(index: string): void;
}

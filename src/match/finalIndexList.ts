import {
    isDisplayIndexTags
} from "../configuration";
import {
    AbstractIndexList, Hook, Hooks
} from "./indexList";
import Tagger from "./tagger";
import * as vscode from "vscode";
import {
    BangumiUrl
} from "../request/bangumiUrl";
import BangumisView from "../views/bangumi";

/**
 * Final index list
 * 没有子选项的选项，它们是最后的选项，需要触发一些特殊操作
 *
 * @abstract
 * @author sdttttt
 */
export abstract class FinalIndexList extends AbstractIndexList
{
    protected abstract readonly tag: string;

    protected readonly openIndexListAfter: Hooks;

    protected readonly openIndexListBefore: Hooks;

    constructor()
    {
        super();
        // Add Hook
        this.openIndexListBefore = [this.pushTagHook];
        this.openIndexListAfter = [this.openBangumiHook, this.showTagHook];
    }

    /**
     * Push tag Hook.
     * 这里必须使用闭包来声明函数.不然会上下文丢失.
     *
     * @param {string} index
     * @author sdttttt
     */
    protected pushTagHook: Hook = (index?: string): void =>
    {
        if (isDisplayIndexTags())
        {
            if (index)
            {
                const tags: Map<string, string> = Tagger.tags;
                tags.set(this.tag, index);
                Tagger.tags = tags;
            }
        }
    };

    /**
     * Shows tag hook
     *
     * @author sdttttt
     */
    private showTagHook(): void
    {
        if (isDisplayIndexTags())
        {
            const tags: Map<string, string> = Tagger.tags;
            if (0 < tags.size)
            {
                let message = "";
                message += "Tags: | ";
                for (const tag of tags.values())
                {
                    message += tag;
                    message += "|";
                }
                message = String(message);
                vscode.window.showInformationMessage(message);
                return;
            }
            vscode.window.showErrorMessage("Tags: 默认");
        }
    }
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
export abstract class SimpleFinalIndexList extends FinalIndexList
{
    protected readonly list: Array<string> = [];

    protected abstract readonly map: Map<string, string>;

    protected abstract updateUrlParams(url: BangumiUrl, index: string): void;

    constructor()
    {
        super();
    }

    /**
     *  Require Run !!
     * 它在你的子类构造函数里必须被运行!!
     *
     * @protected
     * @memberof SimpleFinalIndexList
     * @author sdttttt
     */
    protected init(): void
    {
        this.list.push(...this.map.keys());
    }

    /**
     * condition Handler.
     * 一步到胃!
     *
     * @param index
     * @author sdttttt
     */
    protected conditionHandler(index: string): void
    {
        const url: BangumiUrl = BangumisView.bangumiUrl;
        const param: string | undefined = this.map.get(index);

        if (param)
        {
            this.updateUrlParams(url, param);
        }

        BangumisView.bangumiUrl = url;
    }
}

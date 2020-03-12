"use strict";

import * as vscode from "vscode";
import MainIndexList from "./";
import { getDisplayIndexTags } from '../configuration';

/**
 * Abstract index list
 * 
 * @abstract
 * @class
 * @author sdttttt
 */
export abstract class AbstractIndexList {

    /**
     * List  of abstract index list
     * 
     * @readonly
     * @type {Array<string>}
     */
    protected readonly abstract list: Array<string>;

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
     * @type {() => void}
     * @author sdttttt
     */
    protected readonly abstract openIndexListAfter: Array<(args?: string) => void>;

    /**
     * Hook of Open index list before
     * 
     * @abstract
     * @readonly
     * @type {() => void}
     * @author sdttttt
     */
    protected readonly abstract openIndexListBefore: Array<(args?: string) => void>;

    /**
     * Opens bangumi hook
     * 
     * @author sdttttt
     */
    protected openBangumiHook(): void {
        vscode.commands.executeCommand("openBangumi");
    }

    /**
     * Opens index list
     * 
     * @author sdttttt
     */
    openIndexList(): void {
        vscode.window.showQuickPick(this.list).then(
            (index: string | undefined) => {
                if (index) {
                    
                    // Run Before Hook.
                    if (this.openIndexListBefore.length > 0) {
                        for (const callback of this.openIndexListBefore) {
                            callback(index);
                        }
                    }
                    //------------------

                    this.conditionHandler(index);
                    
                    // Run After Hook.
                    if (this.openIndexListAfter.length > 0) {
                        for (const callback of this.openIndexListAfter) {
                            callback();
                        }
                    }
                    //-----------------
                }
                return;
            }
        );
    }
}

/**
 * Final index list
 * 没有子选项
 * 
 * @abstract
 * @author sdttttt
 */
export abstract class FinalIndexList extends AbstractIndexList {

    protected abstract readonly tag: string;

    protected readonly openIndexListAfter: Array<() => void>;

    protected readonly openIndexListBefore: Array<(v?: string) => void>;

    constructor() {
        super();
        this.openIndexListBefore = [
            this.pushTagHook
        ];
        this.openIndexListAfter = [
            this.openBangumiHook,
            this.showTagHook,
        ];
    }

     /**
     * Pushs tag Hook.
     * 这里必须使用闭包来声明函数.不然会上下文丢失.
     *
     * @param {string} index
     * @author sdttttt
     */
     protected pushTagHook: (index?: string) => void
         = (index?: string) => {
             if (getDisplayIndexTags()) {
                 if (index) {
                     const tags: Map<string, string> = MainIndexList.tags;
                     tags.set(this.tag, index);
                     MainIndexList.tags = tags;
                 }
             }
         }

     /**
     * Shows tag hook
     *
     * @author sdttttt
     */
    private showTagHook(): void {
        if (getDisplayIndexTags()) {
            const tags: Map<string, string> = MainIndexList.tags;
            if (tags.size > 0) {
                let message = "";
                message += "Tags: | ";
                for (const tag of tags.values()) {
                    message += tag;
                    message += "|";
                }
                message += "";
                vscode.window.showInformationMessage(message);
                return;
            }
            vscode.window.showErrorMessage("Tags: 默认");
        }
    }
}
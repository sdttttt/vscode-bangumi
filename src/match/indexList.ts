"use strict";

import * as vscode from "vscode";
import MainIndexList from "./";
import { getDisplayIndexTags } from '../configuration';

export type Hook = (args?: string) => void;
export type Hooks = Array<Hook>;

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
    protected readonly abstract openIndexListAfter: Hooks;

    /**
     * Hook of Open index list before
     * 
     * @abstract
     * @readonly
     * @type {() => void}
     * @author sdttttt
     */
    protected readonly abstract openIndexListBefore: Hooks;

    /**
     * Opens bangumi hook
     * 
     * @author sdttttt
     */
    protected openBangumiHook(): void {
        vscode.commands.executeCommand("openBangumi");
    }

    /**
     * run OpenIndexList Hook.
     *
     * @private
     * @param {string} [index]
     * @memberof AbstractIndexList
     * @author sdttttt
     */
    private runOpenIndexListHook(index?: string): void {
        if (this.openIndexListBefore.length > 0) {
            for (const callback of this.openIndexListBefore) {
                callback(index);
            }
        }
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
                    this.runOpenIndexListHook(index);
                    // Core
                    this.conditionHandler(index);
                    // Run After Hook.
                    this.runOpenIndexListHook(index);
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

    protected readonly openIndexListAfter: Hooks;

    protected readonly openIndexListBefore: Hooks;

    constructor() {
        super();
        // Add Hook
        this.openIndexListBefore = [
            this.pushTagHook
        ];
        this.openIndexListAfter = [
            this.openBangumiHook,
            this.showTagHook,
        ];
    }

     /**
     * Push tag Hook.
     * 这里必须使用闭包来声明函数.不然会上下文丢失.
     *
     * @param {string} index
     * @author sdttttt
     */
     protected pushTagHook: Hook = (index?: string): void => {
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
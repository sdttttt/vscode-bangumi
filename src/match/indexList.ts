"use strict";

import * as vscode from "vscode";

/**
 * Abstract index list
 * 
 * @abstract
 * @class
 * @author sdttttt
 */
export default abstract class AbstractIndexList {
    
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
    protected readonly abstract openIndexListAfter?: () => void;

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
    				this.conditionHandler(index);

    				if (this.openIndexListAfter) 
    				{ this.openIndexListAfter(); }
    			}
    			return;
    		}
    	);
    }
}
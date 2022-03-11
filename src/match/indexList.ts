"use strict";

import * as vscode from "vscode";
import { isDisplayIndexTags } from "../configuration";
import { BangumiUrl } from "../request/bangumiUrl";
import BangumisView from "../views/bangumi";

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
	protected openBangumiHook(): void {
		vscode.commands.executeCommand("openBangumi");
	}

	/**
	 * Run All Hook of List.
	 *
	 * @private
	 * @param {Hooks} hooks
	 * @param {string} [index]
	 * @memberof AbstractIndexList
	 * @author sdttttt
	 */
	private runHooks(hooks: Hooks, index?: string): void {
		if (hooks.length > 0) {
			for (const callback of hooks) {
				callback(index);
			}
		}
	}

	/**
	 * run OpenIndex Hook List.
	 *
	 * @memberof AbstractIndexList
	 * @author sdttttt
	 */
	private runBeforeOpenIndexListHook(index?: string): void {
		this.runHooks(this.openIndexListBefore, index);
	}

	/**
	 * run OpenIndex Hook List
	 *
	 * @memberof AbstractIndexList
	 * @author sdttttt
	 */
	private runAfterOpenIndexListHook(index?: string): void {
		this.runHooks(this.openIndexListAfter, index);
	}

	/**
	 * Opens index list
	 *
	 * @author sdttttt
	 */
	openIndexList(): void {
		vscode.window
			.showQuickPick(this.list)
			.then((index: string | undefined) => {
				if (index) {
					// Run Before Hook.
					this.runBeforeOpenIndexListHook(index);
					// Core
					this.conditionHandler(index);
					// Run After Hook.
					this.runAfterOpenIndexListHook(index);
				}
				return;
			});
	}
}

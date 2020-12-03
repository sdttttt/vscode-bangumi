"use strict";

import * as vscode from "vscode";
import MainIndexList from "./";
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

/**
 * Final index list
 * 没有子选项的选项，它们是最后的选项，需要触发一些特殊操作
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
	protected pushTagHook: Hook = (index?: string): void => {
		if (isDisplayIndexTags()) {
			if (index) {
				const tags: Map<string, string> = MainIndexList.tags;
				tags.set(this.tag, index);
				MainIndexList.tags = tags;
			}
		}
	};

	/**
	 * Shows tag hook
	 *
	 * @author sdttttt
	 */
	private showTagHook(): void {
		if (isDisplayIndexTags()) {
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
export abstract class SimpleFinalIndexList extends FinalIndexList {
	protected readonly list: Array<string> = [];

	protected abstract readonly map: Map<string, string>;

	protected abstract updateUrlParams(url: BangumiUrl, index: string): void;

	constructor() {
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
	protected init(): void {
		this.list.push(...this.map.keys());
	}

	/**
	 * condition Handler.
	 * 一步到胃!
	 *
	 * @param index
	 * @author sdttttt
	 */
	protected conditionHandler(index: string): void {
		const url: BangumiUrl = BangumisView.bangumiUrl;
		const param: string | undefined = this.map.get(index);

		if (param) {
			this.updateUrlParams(url, param);
		}

		BangumisView.bangumiUrl = url;
	}
}

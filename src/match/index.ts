import * as vscode from "vscode";
import { AbstractIndexList, Hooks } from "./indexList";
import YearList from "./yearList";
import SeasonVersionList from "./seasonVersionList";
import AreaList from "./areaList";
import FinishList from "./finishList";
import CopyRightList from "./copyRightList";
import SeasonStatusList from "./seasonStatusList";
import SeasonMonthList from "./seasonMonthList";
import BangumisView from "../views/bangumi";
import StyleList from "./styleList";
import Tagger from "./tagger";

/**
 *	Main List
 *
 *	@author sdttttt
 */
export default new class MainIndexList extends AbstractIndexList {
	protected readonly openIndexListAfter: Hooks = [];

	protected readonly openIndexListBefore: Hooks = [];

	protected readonly list: Array<string> = [
		"类型",
		"地区",
		"状态",
		"版权",
		"付费",
		"季度",
		"时间",
		"风格",
		"(恢复默认)",
	];

	protected conditionHandler(index: string): void {
		switch (index) {
			case "类型":
				SeasonVersionList.openIndexList();
				break;
			case "地区":
				AreaList.openIndexList();
				break;
			case "状态":
				FinishList.openIndexList();
				break;
			case "版权":
				CopyRightList.openIndexList();
				break;
			case "付费":
				SeasonStatusList.openIndexList();
				break;
			case "季度":
				SeasonMonthList.openIndexList();
				break;
			case "时间":
				YearList.openIndexList();
				break;
			case "风格":
				StyleList.openIndexList();
				break;
			case "(恢复默认)":
				BangumisView.bangumiUrl.restoreDefault();
				Tagger.clear();
				break;
			default:
				vscode.window.showInformationMessage("果咩,还在施工中");
		}
	}
};

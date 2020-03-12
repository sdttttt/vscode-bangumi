"use strict";

import AbstractIndexList from "./indexList";
import YearIndexList from "./yearIndexList";

export default new class MainIndexList extends AbstractIndexList {
    
    protected readonly openIndexListAfter?: () => void;

    protected readonly list: Array<string> = [
    	"类型", "地区", "状态", "版权", "付费", "季度", "时间", "风格"
    ];

    protected conditionHandler(index: string): void {
    	switch (index) {
    	case "时间":
    		YearIndexList.openIndexList();
    		break;
    	}
    }
};


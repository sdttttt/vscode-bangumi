import { SimpleFinalIndexList } from "./indexList";
import { BangumiUrl } from "../request/bangumiUrl";

export default new (class SeasonMonthList extends SimpleFinalIndexList {
	protected readonly tag: string = "SeasonMonth";

	protected readonly map: Map<string, string> = new Map([
		["全部", "-1"],
		["一月", "1"],
		["四月", "4"],
		["七月", "7"],
		["十月", "10"],
	]);

	constructor() {
		super();
		this.init();
	}

	protected updateUrlParams(url: BangumiUrl, index: string): void {
		url.setSeasonMonth(index);
	}
})();

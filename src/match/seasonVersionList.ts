import { SimpleFinalIndexList } from "./indexList";
import { BangumiUrl } from "../request/bangumiUrl";

export default new (class SeasonVersionList extends SimpleFinalIndexList {
	protected readonly tag: string = "SeasonVersion";

	protected readonly map: Map<string, string> = new Map([
		["全部", "-1"],
		["正片", "1"],
		["电影", "2"],
		["其他", "3"],
	]);

	constructor() {
		super();
		this.init();
	}

	protected updateUrlParams(url: BangumiUrl, param: string): void {
		url.setSeasonVersion(param);
	}
})();

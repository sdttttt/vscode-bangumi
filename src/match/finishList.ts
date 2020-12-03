import { SimpleFinalIndexList } from "./indexList";
import { BangumiUrl } from "../request/bangumiUrl";

export default new (class FinishList extends SimpleFinalIndexList {
	protected readonly tag: string = "FinishList";

	protected readonly map: Map<string, string> = new Map([
		["全部", "-1"],
		["完结", "1"],
		["连载", "0"],
	]);

	constructor() {
		super();
		this.init();
	}

	protected updateUrlParams(url: BangumiUrl, param: string): void {
		url.setIsFinish(param);
	}
})();

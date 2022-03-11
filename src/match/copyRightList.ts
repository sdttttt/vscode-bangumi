import { SimpleFinalIndexList } from "./finalIndexList";
import { BangumiUrl } from "../request/bangumiUrl";

export default new (class CopyRightList extends SimpleFinalIndexList {
	protected readonly tag: string = "CopyRight";

	protected readonly map: Map<string, string> = new Map([
		["全部", "-1"],
		["独家", "3"],
		["其他", "1"],
	]);

	protected updateUrlParams(url: BangumiUrl, index: string): void {
		url.setCopyright(index);
	}

	constructor() {
		super();
		this.init();
	}
})();

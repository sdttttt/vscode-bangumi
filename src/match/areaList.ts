import { SimpleFinalIndexList } from "./indexList";
import { BangumiUrl } from "../request/bangumiUrl";

export default new (class AreaList extends SimpleFinalIndexList {
	protected readonly tag: string = "Area";

	protected readonly map: Map<string, string> = new Map([
		["全部", "-1"],
		["日本", "2"],
		["美国", "3"],
		[
			"其他",
			encodeURI(
				"1,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55"
			),
		],
	]);

	constructor() {
		super();
		this.init();
	}

	protected updateUrlParams(url: BangumiUrl, param: string): void {
		url.setArea(param);
	}
})();

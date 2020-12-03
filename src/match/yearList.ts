import BangumisView from "../views/bangumi";
import { numberOfStringPlus } from "../utils/strings";
import { FinalIndexList } from "./indexList";

export default new (class YearList extends FinalIndexList {
	protected readonly tag: string = "Year";

	protected readonly list: Array<string> = [
		"2020",
		"2019",
		"2018",
		"2017",
		"2016",
		"2015",
		"2010-2014",
		"2005-2009",
		"2000-2004",
		"90年代",
		"80年代",
		"很久很久以前",
	];

	private encodeYear(years: Array<string>): string {
		return encodeURI(`[${years[0]},${years[1]})`);
	}

	protected conditionHandler(index: string): void {
		const url = BangumisView.bangumiUrl;

		const years: Array<string> = index.split("-");
		if (years.length > 1) {
			years[1] = numberOfStringPlus(years[1], 1);
			url.setYear(this.encodeYear(years));
			return;
		}

		switch (index) {
			case "90年代":
				url.setYear(this.encodeYear(["1990", "2000"]));
				return;
			case "80年代":
				url.setYear(this.encodeYear(["1980", "1990"]));
				return;
			case "很久很久以前":
				url.setYear(this.encodeYear(["", "1980"]));
				return;
		}

		const min: string = index;
		const max: string = numberOfStringPlus(index, 1);
		url.setYear(this.encodeYear([min, max]));
	}

	openIndexList(): void {
		super.openIndexList();
	}
})();

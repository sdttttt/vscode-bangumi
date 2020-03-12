import { FinalIndexList } from './indexList';
import BangumisView from "../views/bangumi";
import { BangumiUrl } from '../request/bangumiUrl';

export default new class SeasonMonthList extends FinalIndexList {
    protected readonly list: Array<string> = [
        "全部", "一月", "四月", "七月", "十月",
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;

        switch (index) {
            case "全部":
                url.setSeasonMonth("-1");
                break;
            case "一月":
                url.setSeasonMonth("1");
                break;
            case "四月":
                url.setSeasonMonth("4");   
                break;
            case "七月":
                url.setSeasonMonth("7");
                break;
            case "十月":
                url.setSeasonMonth("10");
                break;
        }

        BangumisView.bangumiUrl = url;
    }
};
import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from "../views/bangumi";

export default new class SeasonStatusList extends FinalIndexList {

    protected readonly tag: string = "SeasonStatus";

    protected readonly list: Array<string> = [
        "全部", "免费", "付费", "大会员",
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;
        
        switch (index) {
            case "全部":
                url.setSeasonStatus("-1");
                break;
            case "免费":
                url.setSeasonStatus("1");
                break;
            case "付费":
                url.setSeasonStatus("2");
                break;
            case "大会员":
                url.setSeasonStatus("4");
                break;
        }

        BangumisView.bangumiUrl = url;
    }
};
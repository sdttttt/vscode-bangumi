import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from "../views/bangumi";

export default new class SeasonVersionList extends FinalIndexList {

    protected readonly list: Array<string> = [
        "全部", "正片", "电影", "其他"
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;

        switch (index) {
            case "全部":
                url.setSeasonVersion("-1");
                break;
            case "正片":
                url.setSeasonVersion("1");
                break;
            case "电影":
                url.setSeasonVersion("2");
                break;
            case "其他":
                url.setSeasonVersion("3");
                break;
        }

        BangumisView.bangumiUrl = url;
    }
};
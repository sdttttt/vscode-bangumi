import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from "../views/bangumi";

export default new class CopyRightList extends FinalIndexList {

    protected readonly tag: string = "CopyRight";

    protected readonly list: Array<string> = [
        "全部", "独家", "其他",
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;
        switch (index) {
            case "全部":
                url.setCopyright("-1");
                break;
            case "独家":
                url.setCopyright("3");
                break;
            case "其他":
                url.setCopyright("1");
                break;
        }
        BangumisView.bangumiUrl = url;
    }
};
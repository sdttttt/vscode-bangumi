import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from "../views/bangumi";

export default new class AreaList extends FinalIndexList {

    protected readonly tag: string = "Area";

    protected readonly list: Array<string> = [
        "全部", "日本" ,"美国", "其他"
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;
        switch (index) {
            case "全部":
                url.setArea("-1");
                break;
            case "日本":
                url.setArea("2");
                break;
            case "美国":
                url.setArea("3");
                break;
            case "其他":
                // B站有毒... 我能怎么办，我也很绝望啊
                url.setArea(encodeURI("1,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55"));
                break;
        }
        BangumisView.bangumiUrl = url;
    }
};
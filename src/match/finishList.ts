import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from '../views/bangumi';

export default new class FinishList extends FinalIndexList {
    protected readonly list: Array<string> = [
        "全部", "完结", "连载",
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;
        switch (index) {
            case "全部":
                url.setIsFinish("-1");
                break;
            case "完结":
                url.setIsFinish("1");
                break;
            case "连载":
                url.setIsFinish("0");
                break;
        }
        BangumisView.bangumiUrl = url;
    }
};
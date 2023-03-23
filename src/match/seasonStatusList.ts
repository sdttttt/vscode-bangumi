import {
    SimpleFinalIndexList
} from "./finalIndexList";
import {
    BangumiUrl
} from "../request/bangumiUrl";

export default new (class SeasonStatusList extends SimpleFinalIndexList
{
    protected readonly tag: string = "SeasonStatus";

    protected readonly map: Map<string, string> = new Map([
        ["全部", "-1"],
        ["免费", "1"],
        ["付费", "2"],
        ["大会员", "4"],
    ]);

    constructor()
    {
        super();
        this.init();
    }

    protected updateUrlParams(url: BangumiUrl, param: string): void
    {
        url.setSeasonStatus(param);
    }
})();

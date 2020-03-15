import { FinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';
import BangumisView from "../views/bangumi";

export default new class StyleList extends FinalIndexList {

    protected readonly tag: string = "Style";

    protected readonly list: Array<string> = [
        "全部", "漫画改", "小说改", "游戏改", "布袋戏",
        "原创", "热血", "穿越", "奇幻", "战斗", "搞笑",
        "日常", "科幻", "萌系", "治愈", "校园", "少儿",
        "恋爱", "泡面", "少女", "魔法", "冒险", "历史",
        "架空", "机战", "神魔", "声控", "运动", "励志",
        "音乐", "推理", "社团", "智斗", "催泪", "美食",
        "偶像", "乙女", "职场"
    ];

    protected conditionHandler(index: string): void {
        const url: BangumiUrl = BangumisView.bangumiUrl;

        switch (index) {
            case "全部":
                url.setStyleId("-1");
                break;
            case "原创":
                url.setStyleId("10010");
                break;
            case "漫画改":
                url.setStyleId("10011");
                break;
            case "小说改":
                url.setStyleId("10012");
                break;
            case "游戏改":
                url.setStyleId("10013");
                break;
            case "布袋戏":
                url.setStyleId("10015");
                break;
            case "热血":
                url.setStyleId("10016");
                break;
            case "穿越":
                url.setStyleId("10017");
                break;
            case "奇幻":
                url.setStyleId("10018");
                break;
            case "战斗":
                url.setStyleId("10020");
                break;
            case "搞笑":
                url.setStyleId("10021");
                break;
            case "日常":
                url.setStyleId("10022");
                break;
            case "科幻":
                url.setStyleId("10023");
                break;
            case "萌系":
                url.setStyleId("10024");
                break;
            case "治愈":
                url.setStyleId("10025");
                break;
            case "校园":
                url.setStyleId("10026");
                break;
            case "少儿":
                url.setStyleId("10027");
                break;
            case "泡面":
                url.setStyleId("10028");
                break;
            case "恋爱":
                url.setStyleId("10029");
                break;
            case "少女":
                url.setStyleId("10030");
                break;
            case "魔法":
                url.setStyleId("10031");
                break;
            case "冒险":
                url.setStyleId("10032");
                break;
            case "历史":
                url.setStyleId("10033");
                break;
            case "架空":
                url.setStyleId("10034");
                break;
            case "机战":
                url.setStyleId("10035");
                break;
            case "神魔":
                url.setStyleId("10036");
                break;
            case "声控":
                url.setStyleId("10037");
                break;
            case "运动":
                url.setStyleId("10038");
                break;
            case "励志":
                url.setStyleId("10039");
                break;
            case "音乐":
                url.setStyleId("10040");
                break;
            case "推理":
                url.setStyleId("10041");
                break;
            case "社团":
                url.setStyleId("10042");
                break;
            case "智斗":
                url.setStyleId("10043");
                break;
            case "催泪":
                url.setStyleId("10044");
                break;
            case "美食":
                url.setStyleId("10045");
                break;
            case "偶像":
                url.setStyleId("10046");
                break;
            case "乙女":
                url.setStyleId("10047");
                break;
            case "职场":
                url.setStyleId("10048");
                break;
            default:
                break;
        }
        BangumisView.bangumiUrl = url;
    }
};
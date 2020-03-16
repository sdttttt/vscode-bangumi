import { SimpleFinalIndexList } from './indexList';
import { BangumiUrl } from '../request/bangumiUrl';

export default new class StyleList extends SimpleFinalIndexList {

    protected readonly tag: string = "Style";

    protected readonly map: Map<string, string> = new Map([
        ["全部", "-1"], ["原创", "10010"], ["漫画改", "10011"], ["小说改", "10012"],
        ["游戏改", "10013"], ["布袋戏", "10015"], ["热血", "10016"], ["穿越", "10017"],
        ["奇幻", "10018"], ["战斗", "10020"], ["搞笑", "10021"], ["日常", "10022"],
        ["科幻", "10023"], ["萌系", "10024"], ["治愈", "10025"], ["校园", "10026"],
        ["少儿", "10027"], ["泡面", "10028"], ["恋爱", "10029"], ["少女", "10030"],
        ["魔法", "10031"], ["冒险", "10032"], ["历史", "10033"], ["架空", "10034"],
        ["机战", "10035"], ["神魔", "10036"], ["声控", "10037"], ["运动", "10038"],
        ["励志", "10039"], ["音乐", "10040"], ["推理", "10041"], ["社团", "10042"],
        ["智斗", "10043"], ["催泪", "10044"], ["美食", "10045"], ["偶像", "10046"],
        ["乙女", "10047"], ["职场", "10048"],
    ]);

    protected updateUrlParams(url: BangumiUrl, index: string): void {
        url.setStyleId(index);
    }

    constructor() {
        super();
        this.init();
    }
};
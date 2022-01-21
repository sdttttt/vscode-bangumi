import { WeekBangumiData, WBangumi } from "../request/structure";
declare const _default: {
    style: string;
    html?: string | undefined;
    makeOneDay(day: WeekBangumiData): string;
    makeOneBangumi(bangumi: WBangumi): string;
    generateHTML(data: Array<WeekBangumiData>): string;
    readonly htmlBody: string;
    readonly htmlHead: string;
    readonly htmlFloor: string;
    makeCssUri(path: string): void;
};
/**
 * Week Bangumis HTML Generator
 *
 * @class {WeekBangumisHTMLGenerator}
 * @author sdttttt
 */
export default _default;

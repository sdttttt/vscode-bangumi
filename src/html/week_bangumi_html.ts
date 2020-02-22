import { WeekBangumiData, WBangumi } from '../request/structure';
import { toWeekDay } from '../utils/strings';
import AbstractHTMLGenerator from './generator';
import { STYLE } from './week_bangumi_style';
import { toNumber } from '../utils/type';
const HTML_HEAD = "<html>";

/**
 * Week Bangumis HTML Generator
 *
 * @class WeekBangumisHTMLGenerator
 * @author sdttttt
 */
export default new class WeekBangumisHTMLGenerator extends AbstractHTMLGenerator<Array<WeekBangumiData>> {

    protected readonly style: string = STYLE;

    protected readonly htmlBody: string = '<body><div class="container">';

    protected readonly htmlHead: string = "<html>";

    protected readonly htmlFloor: string = "</div></body></html>";

    private makeOneDay(day: WeekBangumiData): string {
        let daysHtml: string = `
    <div class="item">
            <div class="day">
                <h2>${toWeekDay(day.day_of_week)}</h2>
                ${day.date}
            </div>
    `;

        let bangumiDate: string = "";
        for (let bangumi of day.seasons) {
            if (bangumi.pub_time !== bangumiDate) {
                daysHtml += `<div class="time-point">
                🕒${bangumi.pub_time}
            </div>`;
            }
            daysHtml += this.makeOneBangumi(bangumi);
            bangumiDate = bangumi.pub_time;
        }

        daysHtml += "</div>";

        return daysHtml;
    }

    private makeOneBangumi(bangumi: WBangumi): string {
        return `
    <div class="bangumi">
        <div class="cover">
            <a href="${bangumi.url}">
                <img alt="加载不出来鸭!"
                    src="${bangumi.square_cover}">
            </a>
        </div>
        <div class="info">
            <a href="${bangumi.url}">
                <div class="title">${bangumi.title}</div>
            </a>
            <a href="${bangumi.url}">
                <div class="part-number">${bangumi.pub_index}</div>
            </a>
        </div>
    </div>
    `;
    }

    generateHTML(data: Array<WeekBangumiData>): string {

        let html: string = "";

        // for (let day of data) {
        //     html += this.makeOneDay(day);
        // }

        for (let index in data) {
            if (toNumber(index) >= 5) {
                html += this.makeOneDay(data[index]);
            }
        }

        return this.htmlHead + this.style + this.htmlBody + html + this.htmlFloor;
    }
};

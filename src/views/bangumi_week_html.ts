import { WeekBangumiData, WBangumi } from '../request/structure';
import { toWeekDay } from '../utils/strings';
const HTML_HEAD = "<html>";

const STYLE = `
<style type="text/css">
    a {
        text-decoration: none
    }

    a:LINK {
        text-decoration: none;
    }

    a:VISITED {
        color: black;
        text-decoration: none;
    }

    a:HOVER {
        text-decoration: none;
    }

    img {
        width: 100%;
        height: 100%;
        border-radius: 7px;
    }

    .container {
        width: 3500px;
        height: 2000px;
        display: flex;
    }

    .container .item {
        width: 15%;
        height: 750px;
        margin-left: 68px;
    }

    .container .item .day {
        width: 100%;
        border-bottom: 2px #FFEEFF solid;
        margin-bottom: 10px;
    }

    .container .item .bangumi {
        padding-top: 15px;
        padding-left: 20px;
        width: 100%;
        height: 90px;
        border-left: 1px #999 dashed;
        display: flex;
    }

    .container .item .bangumi .cover {
        width: 40%;
        height: 70px;
    }

    .container .item .bangumi .info {
        width: 80%;
        margin-left: 10px;
    }

    .container .item .bangumi .info .title {
        width: 100%;
        height: 60%;
        font-size: 11px;
    }

    .container .item .bangumi .info .part-number {
        width: 100%;
        height: 40%;
        color: #FF88FF;
        font-size: 10px;
    }

    .container .item .time-point {
        width: 70px;
        height: 20px;
        color: #999;
        margin-left: -8px;
        font-weight: 700;
        font-size: 14px;
    }
</style>
`;

const HTML_BODY = `
<body>
<div class="container">
`;

const HTML_FLOOR = "</div></body></html>";

function makeOneDay(day: WeekBangumiData): string {
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
        daysHtml += makeOneBangumi(bangumi);
        bangumiDate = bangumi.pub_time;
    }

    daysHtml += "</div>";

    return daysHtml;
}

function makeOneBangumi(bangumi: WBangumi): string {
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

export function generateHTML(data: Array<WeekBangumiData>): string {
    
    let html: string = "";

    for (let day of data) {
        html += makeOneDay(day);
    }

    return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
}
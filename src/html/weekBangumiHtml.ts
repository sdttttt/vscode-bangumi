"use strict";

import * as vscode from "vscode";
import {
    WeekBangumiData, WBangumi
} from "../request/structure";
import {
    toWeekDay, isToday
} from "../utils/strings";
import AbstractHTMLGenerator from "./generator";
import {
    isDisplayHistory
} from "../configuration";
import {
    getResourceFile
} from "../utils/file";
import {
    YING_LILI, WEEK_BANGUMI_CSS
} from "../constants";

/**
 * Week Bangumis HTML Generator
 *
 * @class {WeekBangumisHTMLGenerator}
 * @author sdttttt
 */
export default new (class WeekBangumisHTMLGenerator extends AbstractHTMLGenerator<
    Array<WeekBangumiData>
>
{
    protected style = "";

    protected html?: string;

    constructor()
    {
        super();
    }

    private makeOneDay(day: WeekBangumiData): string
    {
        let toDayBadge: vscode.Uri | undefined;
        if (isToday(day.date))
        {
            toDayBadge = getResourceFile(YING_LILI);
        }

        let daysHtml = `
    <div class="item ${isToday(day.date) ? "today" : ""}">
            <div class="day">
                <h2>${toWeekDay(day.day_of_week)} ${
        toDayBadge
            ? `<div class="today-badge" ><img src="${toDayBadge}"></div>`
            : ""
    }
                </h2>
                ${day.date}
            </div>
    `;

        let bangumiDate = "";
        for (const bangumi of day.seasons)
        {
            if (bangumi.pub_time !== bangumiDate)
            {
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

    private makeOneBangumi(bangumi: WBangumi): string
    {
        if (1 === bangumi.delay)
        {
            // 拖更了！
            return `
            <div class="bangumi delay">
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
                        <div class="part-number">${bangumi.delay_index}   
                        w(ﾟДﾟ)w ${bangumi.delay_reason}</div>
                    </a>
                </div>
            </div>
            `;
        }

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

    generateHTML(data: Array<WeekBangumiData>): string
    {
        this.html = "";
        this.makeCssUri(WEEK_BANGUMI_CSS);

        if (isDisplayHistory())
        {
            for (const day of data)
            {
                this.html += this.makeOneDay(day);
            }
        }
        else
        {
            let index = 0;
            for (const item of data)
            {
                if (5 <= index)
                {
                    this.html += this.makeOneDay(item);
                }
                index++;
            }
        }

        return (
            this.htmlHead +
            this.style +
            this.htmlBody +
            this.html +
            this.htmlFloor
        );
    }
})();

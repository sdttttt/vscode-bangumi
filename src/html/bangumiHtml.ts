"use strict";

import {
    Bangumi
} from "../request/structure";
import AbstractHTMLGenerator from "./generator";
import {
    BANGUMI_CSS
} from "../constants";

/**
 * Bangumis HTML Generator
 *
 * @class BangumisHTMLGenerator
 * @author sdttttt
 */
export default new (class BangumisHTMLGenerator extends AbstractHTMLGenerator<
    Array<Bangumi>
>
{
    protected style?: string;

    protected html?: string;

    /**
     *  Generate a Bangumi View
     *
     * @param {Bangumi} bangumi
     * @author sdttttt
     */
    private makeLine(bangumi: Bangumi): string
    {
        return `
      <div class="cover" >
        <div class="big"><img src="${bangumi.cover}" alt="抱歉啊" /></div>
        <div class="info">

        ${
    17 < bangumi.title.length
        ? `<h4>${bangumi.title}</h4>`
        : `<h3>${bangumi.title}</h3>`
    }

        <h4>关注度： ${bangumi.order}</h4>
        ${"" !== bangumi.badge ? `<h5>${bangumi.badge}</h5>` : "<h5>❤白嫖</h5>"}
        <span>${
    1 === bangumi.is_finish ? "已完结 😎" : "未完结 😕"
    }</span><br /><br />
        状态: <span>${bangumi.index_show}</span>
        <br /><br />
        <a class="btn" href="${bangumi.link}">To Chase Bangumi</a>
        </div>
      </div>

      `;
    }

    /**
     * Generates Bangumi html
     *
     * @param {Array<Bangumi>} bangumis
     * @returns string
     * @author sdttttt
     */
    generateHTML(bangumis: Array<Bangumi>): string
    {
        this.makeCssUri(BANGUMI_CSS);

        this.html = "";
        for (const bangumi of bangumis)
        {
            this.html += this.makeLine(bangumi);
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

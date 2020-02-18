import { Bangumi } from "../request/structure";
import { STYLE } from "./bangumi_style";
import AbstractHTMLGenerator from './generator';

export default new class BangumisHTMLGenerator extends AbstractHTMLGenerator<Array<Bangumi>> {

  protected readonly style: string = STYLE;

  protected readonly htmlBody: string = '<div class="container">';

  protected readonly htmlHead: string = "<html><body>";

  protected readonly htmlFloor: string = "</div></body></html>";

  /**
   *  Generate a Bangumi View
   *
   * @param {Bangumi} bangumi
   * @author sdttttt
   */
  private makeLine(bangumi: Bangumi): string {
    return `
      <div class="cover" >
        <div class="big"><img src="${bangumi.cover}" alt="抱歉啊" /></div>
        <div class="info">

        ${ bangumi.title.length > 17 ?
        "<h4>" + bangumi.title + "</h4>" :
        "<h3>" + bangumi.title + "</h3>"}

        <h4>关注度： ${bangumi.order}</h4>
        ${bangumi.badge !== "" ? "<h5>" + bangumi.badge + "</h5>" : "<h5>❤白嫖</h5>"}
        <span>${bangumi.is_finish === 1 ? "已完结 😎" : "未完结 😕"}</span><br /><br />
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
  generateHTML(bangumis: Array<Bangumi>): string {

    let html: string = "";
    for (let bangumi of bangumis) {
      html += this.makeLine(bangumi);
    }

    return this.htmlHead + this.style + this.htmlBody + html + this.htmlFloor;
  }
};
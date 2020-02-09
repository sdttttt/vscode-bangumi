import { Bangumi } from "../request/structure";

const HTML_HEAD = "<html><body>";

const STYLE = `
<style type="text/css">
    table {
        width: 500px;
    }
    img {
        width: 100%;
        height: 100%;
    }
    .small {
        height: 200px;
        width: 150px;
    }
    .big {
        height: 200px;
        width: 400px;
    }
    .infomation {
        width: 100%;
        height: 100%;
    }
</style>
`;

const HTML_BODY = `
<div style="container">
        <table border="0">
`;

const HTML_FLOOR = "</table></div></body></html>";

/**
 *  Generate a Bangumi View
 *
 * @param bangumi Bangumi
 */
const makeLine: (b: Bangumi) => string = (bangumi: Bangumi) => `
    <tr>
      <td class="small"><img src="${bangumi.cover}" alt="抱歉啊" /></td>
      <td class="big">
        <div class="infomation">
          <h2>${bangumi.title}</h2>
          <h3>关注度： ${bangumi.order}</h3>
          ${bangumi.badge != "" ? bangumi.badge + "<br />" : "" }
          ${bangumi.is_finish == 1 ? "以及完结了哦" : "未完结" }<br />
          集数: ${bangumi.index_show}
          <br />
          <a href="">To Chase Bangumi</a>
        </div>
      </td>
    </tr>
`;

/**
 * Generates Bangumi html
 * @param data
 * @returns string
 * @author sdttttt
 */
export function generateHTML(bangumis: Array<Bangumi>): string {

  let html: string = "";
  for (let bangumi of bangumis ) {
    html += makeLine(bangumi);
  }

  return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
}
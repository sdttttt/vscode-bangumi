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

type GenerateTag = (text: string) => string;

/**
 * Links make image tag
 * @param link string
 * @returns string
 * @author sdttttt
 */
export const makeImageTag: GenerateTag = (link: string) => `
    <img src="${link}" alt="抱歉啊" />
`;

const makeLine: GenerateTag = (bangumi: any) => `
    <tr>
      <td class="small">${makeImageTag(bangumi.cover)}</td>
      <td class="big">
        <div class="infomation">
          <h2>${bangumi.title}</h2>
          <h3>关注度： ${bangumi.attention}</h3>
          最后一次更新： ${bangumi.lastupdate_at}
          <br />
          地区：${bangumi.area}
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
export function generateHTML(data: any): string {

  const bangumis: Array<any> = data.list;
  let lineCount: number = 0;
  let count: number = bangumis.length >= 30 ? 30 : bangumis.length;

  let html: string = "";
  for (let i = 0; i < count; i++) {
    html += makeLine(bangumis[i]);
  }

  return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
}
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
    td {
        height: 200px;
        width: 150px;
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

/**
 * Texts make td tag
 * @param text
 * @returns string
 * @author sdttttt 
 */
export const makeTdTag: GenerateTag = (text: string) => `
    <td> ${text} </td>
`;


/**
 * Generates html
 * @param data 
 * @returns html 
 * @author sdttttt
 */
export function generateHTML(data: any): string {

    const bangumis: Array<any> = data.list;
    let lineCount: number = 1;
    let count: number = bangumis.length >= 30 ? 30 : bangumis.length;
  
    let html: string = "";
    for (let i = 0; i < count; i++) {
      //每行3个，判断是不是换行了
      if (lineCount % 3 == 0) {
        // 是不是第一个
        if (i == 0) {
          html += "<tr>" + makeTdTag(
            makeImageTag(bangumis[i].cover));
        } else if (i == count) { /* 是不是最后一个 */
          html += "</tr> <tr>" + makeTdTag(
            makeImageTag(bangumis[i].cover)) + "</tr>";
        } else {
          html += "</tr> <tr>" + makeTdTag(
            makeImageTag(bangumis[i].cover));
        }
        lineCount = 1;
      } else {
        lineCount += 1;
        html += makeTdTag(
          makeImageTag(bangumis[i].cover));
      }
    }
  
    return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
  }
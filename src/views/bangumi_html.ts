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
 * make table first line
 * @param bangumi 
 * @returns string
 * @author sdttttt
 */
const makeFirstTag: GenerateTag = (bangumi: any) => `
    <tr> ${makeTdTag(makeImageTag(bangumi.cover))}    
`;

/**
 * make table last line
 * @param bangumi 
 * @returns string
 * @author sdttttt
 */
const makeLastTag: GenerateTag = (bangumi: any) => `
    </tr> <tr>  ${makeTdTag(makeImageTag(bangumi.cover))} </tr>
`; 

/**
 * make table new line
 * @param bangumi 
 * @returns string
 * @author sdttttt
 */
const makeNewLineTag: GenerateTag = (bangumi: any) => `
    </tr> <tr> ${makeTdTag(makeImageTag(bangumi.cover))}
`;

/**
 * make td in table
 * @param bangumi
 * @returns string
 * @author sdttttt
 */
const makeReuseTag: GenerateTag = (bangumi: any) => makeTdTag(
    makeImageTag(bangumi.cover));

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
      //每行3个，判断是不是换行了
      if (lineCount % 3 == 0) {
        // 是不是第一个
        if (i == 0) {
          html += makeFirstTag(bangumis[i]);
        } else if (i == count) { /* 是不是最后一个 */
          html += makeLastTag(bangumis[i]);
        } else {
          html += makeNewLineTag(bangumis[i]);
        }
        lineCount = 1;
      } else {
        lineCount += 1;
        html += makeReuseTag(bangumis[i]);
      }
    }
  
    return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
  }
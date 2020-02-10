import { Bangumi } from "../request/structure";

const HTML_HEAD = "<html><body>";

const STYLE = `
<style type="text/css">
.container {
  display: flex;
  margin:20px;
  width:80%;
  height:80% ;
  flex-wrap: wrap;
}

.cover {
  width:420px;
  height:250px;
  margin:10px;
  display:flex;
}

.big {
  margin-top: 15px;
  height: 220px;
  width: 200px;
  z-index: 2;
}

img {
  border-radius: 10px;
  width: 100%;
  height: 100%;
}

.info {
  width: 450px;
  background-image: linear-gradient(to right, #555555,  rgba(0,0,0,0));
  color: #FFF;
  border-radius: 30px;
  margin-left: -30px;
  z-index: 1;
  text-align: center;
}

a {color: #FFF;TEXT-DECORATION: none}
a:active {background: #888}
.btn{
    height: 22px;
    line-height: 19px;
    padding: 0 11px;
    background: #FFBBFF;
    border: 1px #E5E7EA solid;
    border-radius: 3px;
    display: inline-block;
    font-size: 14px;
    outline: none;
 }

</style>
`;

const HTML_BODY = `
<div class="container">
`;

const HTML_FLOOR = "</div></body></html>";

/**
 *  Generate a Bangumi View
 *
 * @param {Bangumi} bangumi
 * @author sdttttt
 */
const makeLine: (b: Bangumi) => string = (bangumi: Bangumi) => `
  <div class="cover" >
    <div class="big"><img src="${bangumi.cover}" alt="抱歉啊" /></div>
    <div class="info">

      ${ bangumi.title.length > 17 ?
  "<h4>" + bangumi.title + "</h4>" :
  "<h3>" + bangumi.title + "</h3>"}

      <h4>关注度： ${bangumi.order}</h4>
      ${bangumi.badge != "" ? "<h5>" + bangumi.badge + "</h5>" : "<h5>❤白嫖</h5>"}
      <span>${bangumi.is_finish == 1 ? "已完结 😎" : "未完结 😕"}</span><br /><br />
      状态: <span>${bangumi.index_show}</span>
      <br /><br />
      <a class="btn" href="${bangumi.link}">To Chase Bangumi</a>
    </div>
  </div>

    `;

/**
 * Generates Bangumi html
 *
 * @param {Array<Bangumi>} bangumis
 * @returns string
 * @author sdttttt
 */
export function generateHTML(bangumis: Array<Bangumi>): string {

  let html: string = "";
  for (let bangumi of bangumis) {
    html += makeLine(bangumi);
  }

  return HTML_HEAD + STYLE + HTML_BODY + html + HTML_FLOOR;
}
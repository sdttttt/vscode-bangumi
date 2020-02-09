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
  width:400px;
height:200px;
margin:10px;
display:flex;
}

.big {
  height: 200px;
  width: 150px;
  z-index: 2;
}

img {
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

</style>
`;

const HTML_BODY = `
<div class="container">
`;

const HTML_FLOOR = "</div></body></html>";

/**
 *  Generate a Bangumi View
 *
 * @param bangumi Bangumi
 * @author sdttttt
 */
const makeLine: (b: Bangumi) => string = (bangumi: Bangumi) => `
  <div class="cover" >
    <div class="big"><img src="${bangumi.cover}" alt="抱歉啊" /></div>
    <div class="info">
      <h3>${bangumi.title}</h3>
      <h4>关注度： ${bangumi.order}</h4>
      ${bangumi.badge != "" ? bangumi.badge + "<br />" : ""}
      ${bangumi.is_finish == 1 ? "以及完结了哦" : "未完结"}<br />
      集数: ${bangumi.index_show}
      <br />
      <a href="">To Chase Bangumi</a>
    </div>
  </div>

    `;

/**
 * Generates Bangumi html
 *
 * @param bangumis Array<Bangumi>
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
/**
 * Bangumi css style
 *
 * @export
 * @author sdttttt
 */
export const STYLE: string = `
<style type="text/css">
.container {
  display: flex;
  margin:20px;
  width:100%;
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
/**
 * Week Bangumi css style
 *
 * @export
 * @author sdttttt
 */
export const STYLE: string = `
<style type="text/css">
    a {
        text-decoration: none
    }

    a:LINK {
        text-decoration: none;
    }

    a:VISITED {
        color: black;
        text-decoration: none;
    }

    a:HOVER {
        text-decoration: none;
    }

    img {
        width: 100%;
        height: 100%;
        border-radius: 7px;
    }

    .today-badge {
        width: 25px;
        height: 25px;
        display:inline-block;
    }

    .container {
        width: 3500px;
        height: 2000px;
        display: flex;
    }

    .container .today {
        margin-top: -5px;
    }

    .container .item {
        width: 222px;
        height: 750px;
        margin-left: 68px;
    }

    .container .item .day {
        width: 100%;
        border-bottom: 2px #FFEEFF solid;
        margin-bottom: 10px;
    }

    .delay {
        opacity: 0.5;
    }

    .container .item .bangumi {
        padding-top: 15px;
        padding-left: 20px;
        width: 100%;
        height: 90px;
        border-left: 1px #999 dashed;
        display: flex;
    }

    .container .item .bangumi .cover {
        width: 40%;
        height: 70px;
    }

    .container .item .bangumi .info {
        width: 80%;
        margin-left: 10px;
    }

    .container .item .bangumi .info .title {
        width: 100%;
        height: 60%;
        font-size: 11px;
    }

    .container .item .bangumi .info .part-number {
        width: 100%;
        height: 40%;
        color: #FF88FF;
        font-size: 10px;
    }

    .container .item .time-point {
        width: 70px;
        height: 20px;
        color: #999;
        margin-left: -8px;
        font-weight: 700;
        font-size: 14px;
    }
</style>
`;
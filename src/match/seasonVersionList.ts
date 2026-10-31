import { valueFilter } from "./filterSpec";

/**
 * 番剧类型筛选：正片、电影或其他。
 *
 * @author sdttttt
 */
export default valueFilter(
    "类型",
    "SeasonVersion",
    [
        ["全部", "-1"],
        ["正片", "1"],
        ["电影", "2"],
        ["其他", "3"],
    ],
    "seasonVersion"
);

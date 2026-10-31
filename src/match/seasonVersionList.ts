import { valueFilter } from "./filterSpec";

/**
 * Season type filter: main story, movie, or anything else.
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

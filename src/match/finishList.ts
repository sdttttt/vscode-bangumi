import { valueFilter } from "./filterSpec";

/**
 * 是否完结的筛选。
 *
 * @author sdttttt
 */
export default valueFilter(
    "状态",
    "FinishList",
    [
        ["全部", "-1"],
        ["完结", "1"],
        ["连载", "0"],
    ],
    "isFinish"
);

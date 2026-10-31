import { valueFilter } from "./filterSpec";

/**
 * Whether the season has finished.
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

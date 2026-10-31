import { valueFilter } from "./filterSpec";

/**
 * Season month filter.
 *
 * @author sdttttt
 */
export default valueFilter(
    "季度",
    "SeasonMonth",
    [
        ["全部", "-1"],
        ["一月", "1"],
        ["四月", "4"],
        ["七月", "7"],
        ["十月", "10"],
    ],
    "seasonMonth"
);

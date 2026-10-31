import { valueFilter } from "./filterSpec";

/**
 * Payment filter.
 *
 * @author sdttttt
 */
export default valueFilter(
    "付费",
    "SeasonStatus",
    [
        ["全部", "-1"],
        ["免费", "1"],
        ["付费", "2"],
        ["大会员", "4"],
    ],
    "seasonStatus"
);

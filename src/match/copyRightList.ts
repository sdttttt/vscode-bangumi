import { valueFilter } from "./filterSpec";

/**
 * Copyright filter.
 *
 * @author sdttttt
 */
export default valueFilter(
    "版权",
    "CopyRight",
    [
        ["全部", "-1"],
        ["独家", "3"],
        ["其他", "1"],
    ],
    "copyright"
);

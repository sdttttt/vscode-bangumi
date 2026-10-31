import { valueFilter } from "./filterSpec";

/**
 * 版权筛选。
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

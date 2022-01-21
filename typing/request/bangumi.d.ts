import { BangumiUrl } from "./bangumiUrl";
import { WeekBangumiData, BangumisData } from "./structure";
/**
 * HTTP Request Gets all bangumi
 *
 * @param callback
 * @async
 * @author sdttttt
 */
export declare function getAllBangumi(burl: BangumiUrl): Promise<BangumisData | undefined>;
/**
 * Gets week bangumi
 *
 * @param {(data: Array<WeekBangumiData>) => void} callback
 * @async
 * @author sdttttt
 */
export declare function getWeekBangumi(): Promise<Array<WeekBangumiData> | undefined>;

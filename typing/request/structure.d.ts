/**
 * Determines whether success is
 *
 * @param {BiliResponse} res
 * @returns true if success
 * @author sdttttt
 */
export declare function isSuccess(res: BiliResponse): boolean;
/**
 *  The bangumisResponse is Valid Bangumis Request ?
 *
 * @export
 * @param {BangumisResponse} bangumisResponse
 * @returns
 * @author sdttttt
 */
export declare function isValidBangumisRequest(bangumisResponse: BangumisResponse): boolean;
/**
 * Bili response
 *
 * @interface BiliResponse
 * @author sdttttt
 */
export interface BiliResponse {
    code: number;
    message: string;
}
/**
 * Structure of Bangumi Response
 *
 * @export
 * @interface BangumisResponse
 * @author sdttttt
 */
export interface BangumisResponse extends BiliResponse {
    data: BangumisData;
}
/**
 *  Bangumi Data
 *
 * @export
 * @interface BangumisData
 * @author sdttttt
 */
export interface BangumisData {
    has_next: number;
    list: Array<Bangumi>;
}
/**
 * Bangumi Structure
 *
 * @export
 * @interface Bangumis
 * @author sdttttt
 */
export interface Bangumi {
    badge: string;
    cover: string;
    index_show: string;
    is_finish: number;
    link: string;
    order: string;
    title: string;
}
/**
 *  Week Bangumi Response
 *
 * @export
 * @interface WeekBangumiResponse
 * @author sdttttt
 */
export interface WeekBangumiResponse extends BiliResponse {
    result: Array<WeekBangumiData>;
}
/**
 * Week Bangumi Data
 *
 * @export
 * @interface WeekBangumiData
 * @author sdttttt
 */
export interface WeekBangumiData {
    date: string;
    date_ts: number;
    day_of_week: number;
    is_today: number;
    seasons: Array<WBangumi>;
}
/**
 * Bangumi of Week
 *
 * @export
 * @interface WBangumi
 * @author sdttttt
 */
export interface WBangumi {
    cover: string;
    favorites: number;
    is_published: number;
    pub_index: string;
    pub_time: string;
    pub_ts: number;
    square_cover: string;
    title: string;
    url: string;
    delay: number;
    delay_index: string;
    delay_reason: string;
}

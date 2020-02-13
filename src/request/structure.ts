/**
 * Structure of Bangumi Response
 *
 * @export
 * @interface BangumisResponse
 * @author sdttttt
 */
export interface BangumisResponse {
    // 0 is Success
    code: number;

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
    // Bangumis of Bilibili, need Play permission
    badge: string;
    // Number of sets
    cover: string;
    // 几集了
    index_show: string;
    // The end?
    is_finish: number;
    // Play Address
    link: string;
    // count of Chase Bangumi
    order: string;
    // Bangumi name
    title: string;
}


//=========================================== Week Bangumi ========================================

/**
 *  Week Bangumi Response
 *
 * @export
 * @interface WeekBangumiResponse
 * @author sdttttt
 */
export interface WeekBangumiResponse {
    code: number;
    message: string;
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
    pub_ts: string;
    square_cover: string;
    title: string;
    url: string;
}
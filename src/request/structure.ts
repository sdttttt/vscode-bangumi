/**
 * Structure of Bangumi Response
 *
 * @export
 * @interface BangumisResponse
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
 */
interface BangumisData {

    has_next: number;

    list: Array<Bangumi>;
}

/**
 * Bangumi Structure
 *
 * @export
 * @interface Bangumis
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
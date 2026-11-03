import { isEmptyArray, isEmptyObject } from "../../utils/type";

/**
 * B 站接口的响应 schema：索引与周番的原始字段类型，以及「响应是否可用」的纯谓词。
 *
 * @author sdttttt
 */

/**
 * 判断接口响应是否成功。
 *
 * 上报失败是调用方的事，面向用户的文案由调用方持有；这个判定保持纯函数，
 * 因此无需编辑器即可测试。
 *
 * @param res 接口响应
 * @returns 成功时返回 true
 * @author sdttttt
 */
export function isSuccess(res: BiliResponse): boolean {
    if (null === res || undefined === res) {
        return false;
    }

    return 0 === res.code && "success" === res.message;
}

/**
 * 番剧索引响应是否为有效的番剧数据。
 *
 * @export
 * @param bangumisResponse 番剧索引响应
 * @returns 有效时返回 true
 * @author sdttttt
 */
export function isValidBangumisRequest(
    bangumisResponse: BangumisResponse
): boolean {
    return (
        isSuccess(bangumisResponse) &&
        !isEmptyObject(bangumisResponse.data) &&
        !isEmptyArray(bangumisResponse.data.list)
    );
}

/**
 * B 站接口的通用响应结构。
 *
 * @interface BiliResponse
 * @author sdttttt
 */
export interface BiliResponse {
    // 0 表示成功
    code: number;

    // 成功时的文案
    message: string;
}

/**
 * 番剧索引响应的结构。
 *
 * @export
 * @interface BangumisResponse
 * @author sdttttt
 */
export interface BangumisResponse extends BiliResponse {
    data: BangumisData;
}

/**
 * 番剧索引的数据部分。
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
 * 单部番剧的结构。
 *
 * @export
 * @interface Bangumi
 * @author sdttttt
 */
export interface Bangumi {
    // 番剧徽标，需要播放权限才会显示
    badge: string;
    // 封面地址
    cover: string;
    // 更新进度，例如「更新至第 3 话」
    index_show: string;
    // 是否完结
    is_finish: number;
    // 播放地址
    link: string;
    // 追番人数
    order: string;
    // 番剧名称
    title: string;
}

//=============================== 周番数据 =================================

/**
 * 周番数据响应的结构。
 *
 * @export
 * @interface WeekBangumiResponse
 * @author sdttttt
 */
export interface WeekBangumiResponse extends BiliResponse {
    result: Array<WeekBangumiData>;
}

/**
 * 周番数据中某一天的内容。
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
 * 周番表中的单部番剧。
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
    /** 延期到的集数说明；接口在 delay=0 时整体省略该字段。 */
    delay_index?: string;
    /** 延期原因，同样可能整体缺失。 */
    delay_reason?: string;
}

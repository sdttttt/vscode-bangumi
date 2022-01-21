export declare const BANGUMI_WEEK = "https://bangumi.bilibili.com/web_api/timeline_global";
/**
 * Bangumi url
 * Use Build mode
 *
 * @author sdttttt
 */
export declare class BangumiUrl {
    constructor();
    private _finalUrl;
    private _seasonVersion;
    private _area;
    private _isFinish;
    private _copyright;
    private _seasonStatus;
    private _seasonMonth;
    private _year;
    private _styleId;
    private _order;
    private _st;
    private _sort;
    private _page;
    private _seasonType;
    private _pagesize;
    private _type;
    /**
     * Default bangumi url
     *
     * @author sdttttt
     */
    restoreDefault(): void;
    setSeasonVersion(value: string): this;
    setArea(value: string): this;
    setIsFinish(value: string): this;
    setCopyright(value: string): this;
    setStyleId(value: string): this;
    setSt(value: string): this;
    setSort(value: string): this;
    setPage(value: number): this;
    setSeasonStatus(value: string): this;
    setSeasonMonth(value: string): this;
    setYear(value: string): this;
    setSeasonType(value: string): this;
    setPageSize(value: string): this;
    setType(value: string): this;
    private and;
    private add;
    private next;
    /**
     * Build finalUrl of BangumiUrl
     *
     * @returns {this}
     * @memberof BangumiUrl
     * @author sdttttt
     */
    build(): this;
    /**
     * Get finalUrl on Builded
     *
     * @readonly
     * @type {string}
     * @memberof BangumiUrl
     */
    get finalUrl(): string;
}

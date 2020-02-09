
// bilibili API => show all Bangumi
 const BANGUMI_SHOW = "https://api.bilibili.com/pgc/season/index/result?";

/**
 * Bangumi url
 * use Build mode
 * 
 * TODO: NOT TEST
 * 
 * @author sdttttt
 */
export class BangumiUrl {
    constructor() {

        this._finalUrl = BANGUMI_SHOW;

        this._seasonVersion = "-1";
        this._area = "-1";
        this._isFinish = "-1";
        this._copyright = "-1";
        this._seasonStatus = "-1";
        this._seasonMonth = "-1";
        this._year = "-1";
        this._styleId = "-1";
        this._order = "3";
        this._sort = "0";
        this._st = "1";
        this._page = "0";
        this._seasonType = "1";
        this._pagesize = "20";
        this._type = "1";
    }
    
    private _finalUrl: string;

    private _seasonVersion: string;
    private _area: string;
    private _isFinish: string;
    private _copyright: string;
    private _seasonStatus: string;
    private _seasonMonth: string;
    private _year: string;
    private _styleId: string;
    private _order: string;
    private _st: string;
    private _sort: string;
    private _page: string;
    private _seasonType: string;
    private _pagesize: string;
    private _type: string;

    setSeasonVersion(value: string): this {
        this._seasonVersion = value;
        return this;
    }
    
    setArea(value: string): this {
        this._area = value;
        return this;
    }

    setIsFinish(value: string): this {
        this._isFinish = value;
        return this;
    }

    setCopyright(value: string): this {
        this._copyright = value;
        return this;
    }

    setStyleId(value: string): this {
        this._styleId = value;
        return this;
    }

    setSt(value: string): this {
        this._st = value;
        return this;
    }

    setSort(value: string): this {
        this._sort = value;
        return this;
    }

    setPage(value: string): this {
        this._page = value;
        return this;
    }


    setSeasonStatus(value: string): this {
        this._seasonStatus = value;
        return this;
    }

    setYear(value: string): this {
        this._year = value;
        return this;
    }

    setSeasonType(value: string): this {
        this._seasonType = value;
        return this;
    }

    setPageSize(value: string): this {
        this._pagesize = value;
        return this;
    }

    setType(value: string): this {
        this._type = value;
        return this;
    }

    private and(): this {
        this._finalUrl += "&";
        return this;
    }

    private add(key: string, value: string): this {
        this._finalUrl += key;
        this._finalUrl += "=";
        this._finalUrl += value;
        return this;
    }

    private next(key: string, value: string): this {
        return this.add(key, value).and();
    }

    build(): this {
         
        return this
        .next("season_version", this._seasonVersion)
        .next("area", this._area)
        .next("is_finish", this._isFinish)
        .next("copyright", this._copyright)
        .next("season_status", this._seasonStatus)
        .next("season_month", this._seasonMonth)
        .next("year", this._year)
        .next("style_id", this._styleId)
        .next("order", this._order)
        .next("st", this._st)
        .next("sort", this._sort)
        .next("page", this._page)
        .next("season_type", this._seasonType)
        .next("pagesize", this._pagesize)
        .next("type", this._type);
    }

    get finalUrl(): string {
        return this._finalUrl;
    }
}
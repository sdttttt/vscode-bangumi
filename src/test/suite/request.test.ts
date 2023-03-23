"use strict";

import {
    expect
} from "chai";
import {
    getAllBangumi, getWeekBangumi
} from "../../request/bangumi";
import {
    BangumiUrl
} from "../../request/bangumiUrl";
import {
    Bangumi,
    BangumisData,
    WeekBangumiData,
    WBangumi,
} from "../../request/structure";
import {
    getTodayIndexInWeekBangumi
} from "../../utils/strings";

/**
 * There's something wrong with the environment.
 * Need Test.
 *
 * @author sdttttt
 */
suite("TEST API", () =>
{
    test("BILIBILI BANGUMI API TEST", async () =>
    {
        const callback: (res: BangumisData | undefined) => void = (
            data: BangumisData | undefined
        ) =>
        {
            if (data)
            {
                const hasNext: number = data.has_next;
                const bangumis: Array<Bangumi> = data.list;

                const bangumi: Bangumi = bangumis[1];

                // exists Next Page
                expect(hasNext).to.equal(1);

                // tslint:disable-next-line: no-unused-expression
                expect(bangumis).to.be.exist;

                expect(bangumis.length).to.not.equal(0);
                expect(bangumis.length).to.be.above(1);

                // tslint:disable-next-line: no-unused-expression
                expect(bangumi).to.be.exist;
            }
            else
            {
                return Error("数据获取为空🅰");
            }
        };

        const url = new BangumiUrl();
        await getAllBangumi(url).then(callback);
    });

    test("BILIBILI WEEK API TEST", async () =>
    {
        const callback: (data: Array<WeekBangumiData> | undefined) => void = (
            barr: Array<WeekBangumiData> | undefined
        ) =>
        {
            if (barr)
            {
                const index: number | undefined =
                    getTodayIndexInWeekBangumi(barr);

                // tslint:disable-next-line: no-unused-expression
                expect(index).to.be.exist;

                // tslint:disable-next-line: no-unused-expression
                expect(barr).to.not.empty;
                expect(barr.length).to.be.above(1);

                for (const data of barr)
                {
                    const date: string = data.date;
                    const dataTs: number = data.date_ts;
                    const dayOfWeek: number = data.day_of_week;
                    const isToday: number = data.is_today;

                    // tslint:disable-next-line: no-unused-expression
                    expect(data).to.not.empty;
                    expect(date.length).to.be.above(0);
                    // tslint:disable-next-line: no-unused-expression
                    expect(dataTs).to.exist;
                    // tslint:disable-next-line: no-unused-expression
                    expect(dayOfWeek).to.be.exist;
                    expect(isToday).to.be.within(0, 1);

                    const seasons: Array<WBangumi> = data.seasons;

                    expect(seasons.length).to.be.least(0);

                    if (seasons && 0 < seasons.length)
                    {
                        for (const bangumi of seasons)
                        {
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.cover).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.favorites).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.is_published)
                                .to.be.least(0)
                                .that.most(1);
                            expect(bangumi.delay).to.be.least(0).that.most(1);

                            if (0 === bangumi.delay)
                            {
                                // tslint:disable-next-line: no-unused-expression
                                expect(bangumi.pub_index).to.be.exist;
                            }
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.pub_time).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.pub_ts).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.square_cover).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.title).to.be.exist;
                            // tslint:disable-next-line: no-unused-expression
                            expect(bangumi.url).to.be.exist;
                        }
                    }
                }
            }
            else
            {
                return Error("数据获取为空🅰");
            }
        };
        await getWeekBangumi().then(callback);
    });
});

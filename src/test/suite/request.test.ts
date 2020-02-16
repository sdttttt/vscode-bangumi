import { expect } from 'chai';
import { getAllBangumi, getWeekBangumi } from '../../request/bangumi';
import { BangumiUrl } from "../../request/bangumi_url";
import { Bangumi, BangumisData, WeekBangumiData, WBangumi } from '../../request/structure';

/**
 * There's something wrong with the environment.
 * Need Test.
 *
 * @author sdttttt
 */
suite("TEST API", () => {

    test("BILIBILI BANGUMI API TEST", function (done) {
        const callback: (res: BangumisData) => void =
            (data: BangumisData) => {
                const hasNext: number = data.has_next;
                const bangumis: Array<Bangumi> = data.list;

                const bangumi: Bangumi = bangumis[1];

                // request Successful
                try {

                    // exists Next Page
                    expect(hasNext).to.equal(1);

                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumis).to.be.exist;

                    expect(bangumis.length).to.not.equal(0);
                    expect(bangumis.length).to.be.above(1);

                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumi).to.be.exist;

                    done();
                } catch (err) {
                    done(err);
                }
            };

        const url = new BangumiUrl();
        getAllBangumi(url, callback);
    });

    test("BILIBILI WEEK API TEST", function (done) {
    
        const callback: (data: Array<WeekBangumiData>) => void =
            (barr: Array<WeekBangumiData>) => {
                try {
                    const data = barr[0];

                    // tslint:disable-next-line: no-unused-expression
                    expect(barr).to.not.empty;
                    expect(barr.length).to.be.above(1);

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

                    // tslint:disable-next-line: no-unused-expression
                    expect(seasons).to.not.empty;
                    expect(seasons.length).to.be.above(0);

                    const bangumi = seasons[0];

                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumi.cover).to.be.exist;
                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumi.favorites).to.be.exist;
                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumi.is_published).to.be.exist;
                    // tslint:disable-next-line: no-unused-expression
                    expect(bangumi.pub_index).to.be.exist;
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

                    done();
                } catch (err) {
                    done(err);
                }
            };

        getWeekBangumi(callback);
    });
});

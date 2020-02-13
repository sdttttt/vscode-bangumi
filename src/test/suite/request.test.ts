import { expect } from 'chai';
import { getAllBangumi } from "../../request/bangumi";
import { BangumiUrl } from "../../request/bangumi_url";
import { BangumisResponse, Bangumi, BangumisData } from '../../request/structure';

type BangumiCall = (res: BangumisData) => void;

/**
 * There's something wrong with the environment.
 * Need Test.
 *
 * @author sdttttt
 */
suite("TEST API", () => {

    test("BILIBILI BANGUMI API TEST", function (done) {
        const callback: BangumiCall  = (data: BangumisData) => {
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
});

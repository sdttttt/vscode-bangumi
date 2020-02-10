import { expect } from 'chai';
import * as vscode from "vscode";
import * as assert from "assert";
import { getAllBangumi } from "../../request/bangumi";
import { BangumiUrl } from "../../utils/bangumi_url";
import { BangumisResponse, Bangumi } from '../../request/structure';

type BangumiCall = (res: BangumisResponse) => void

/**
 * There's something wrong with the environment.
 * Need Test.
 *
 * @author sdttttt
 */
suite("TEST API", () => {

    test("BILIBILI BANGUMI API TEST", function (done) {
        const callback: BangumiCall  = (res: BangumisResponse) => {
            const code: number = res.code;
            const data = res.data;

            const hasNext: number = data.has_next;
            const bangumis: Array<Bangumi> = data.list;

            const bangumi: Bangumi = bangumis[1];

            // request Successful
            try {
                expect(code).to.equal(0);

                // exists Next Page
                expect(hasNext).to.equal(1);

                expect(bangumis).to.be.exist;

                expect(bangumis.length).to.not.equal(0)
                expect(bangumis.length).to.be.above(1);

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

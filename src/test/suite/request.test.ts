import * as vscode from "vscode";
import * as assert from "assert";
import { getAllBangumi } from "../../request/bangumi";
import { BangumiUrl } from "../../utils/bangumi_url";
import { BangumisResponse } from "../../request/structure";

/**
 * There's something wrong with the environment.
 * Need Test.
 * TODO: Test
 *
 * @author sdttttt
 */
suite("Test API", () => {
    test("bilibili Bangumi API", () => {
        const callback: (res: BangumisResponse) => void = (data: any) => {
        };

        const url = new BangumiUrl();
        getAllBangumi(url, callback);
    });
});

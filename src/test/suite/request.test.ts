import * as vscode from "vscode";
import * as assert from "assert";
import { getAllBangumi } from "../../request/bangumi";
import { BangumiUrl } from "../../utils/constant";


/**
 * There's something wrong with the environment.
 * Need Test.
 * TODO: Test
 */
suite("Test API", () => {
    test("bilibili Bangumi API", () => {
        const callback: (data: any) => void = (data: any) => {
            console.log(data);
        };

        const url = new BangumiUrl();
        getAllBangumi(url, callback);
    });
});

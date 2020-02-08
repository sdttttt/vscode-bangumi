import * as vscode from "vscode";
import * as assert from "assert";
import { getAllBangumi } from "../../request/bangumi";

suite("Test API", () => {

    test("bilibili Bangumi API", () => {
        const callback: (data: any) => void = (data: any) => {
            
            const count: number = data.count;
            const bangumiList: Array<any> = data.list;

            console.log(data.count);
            
            assert.equal(true, data.count >= 0);
            assert.equal(true, bangumiList.length >= 0);
        };

        getAllBangumi(callback);    
    });
    
});

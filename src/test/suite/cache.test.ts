"use strict";

import { Cache } from "../../request/cache";
import { expect } from "chai";
suite("Cache Test", () => {

	test("Running TEST", () => {
		const cache: Cache<number> = new Cache(10);

		cache.set("one", 1);
		cache.set("two", 2);
        
		expect(cache.get("one")).to.be.equal(1);
		expect(cache.get("two")).to.be.equal(2);

		const cache2: Cache<string> = new Cache(10);

		cache2.set("one", "1");
		cache2.set("two", "2");

		expect(cache2.get("one")).to.be.equal("1");
		expect(cache2.get("two")).to.be.equal("2");

		const cache3: Cache<object> = new Cache(10);
		const obj: object = {one: 1, two: "2"};
        
		cache3.set("object", obj);
        
		expect(cache3.get("object")).to.be.equal(obj);
	});

});
"use strict";

import { toNumber, isEmptyArray, isEmptyObject } from "../../utils/type";
import { isToday, 
	currentTimestamp, 
	toWeekDay, 
	toMinuteFromSecode, 
	randomInteger} from "../../utils/strings";
import { expect } from "chai";

/**
 * Utils TEST
 *
 * @author sdttttt
 */
suite("Utils TEST", () => {

	test("toNumber", () => {
		const str = "1";
		const num: number = toNumber(str);

		const undef = undefined;

		expect(num).to.be.equal(1);

		// tslint:disable-next-line: no-unused-expression
		expect(toNumber(undef)).to.be.equal(0);
	});

	test("is empty Array TEST", () => {
		const emptyArr: Array<unknown> = [];
		const arr: Array<number> = [1, 2, 3];
		const arr2: Array<string> = ["a", "b", "c"];
		// tslint:disable-next-line: no-unused-expression
		expect(isEmptyArray(emptyArr)).to.be.true;
		// tslint:disable-next-line: no-unused-expression
		expect(isEmptyArray(arr)).to.be.false;
		// tslint:disable-next-line: no-unused-expression
		expect(isEmptyArray(arr2)).to.be.false;
	});

	test("is empty Object TEST", () => {
		const emptyObj: object = {};
		const obj: object = { a: 1 };

		// tslint:disable-next-line: no-unused-expression
		expect(isEmptyObject(emptyObj)).to.be.true;
		// tslint:disable-next-line: no-unused-expression
		expect(isEmptyObject(obj)).to.be.false;
	});

	test("today TEST", () => {
		const currentTime: Date = new Date();
		const today: string = (currentTime.getMonth() + 1) + "-" + currentTime.getDate();

		// tslint:disable-next-line: no-unused-expression
		expect(isToday(today)).to.be.true;
	});

	test("timestamp TEST", () => {
		expect(currentTimestamp()).to.be.a("number");
	});

	test("Number to Week String TEST", () => {
		expect(toWeekDay(1)).to.be.equal("星期一");
		expect(toWeekDay(5)).to.be.equal("星期五");

		expect(toWeekDay(0)).to.be.equal("");
		expect(toWeekDay(8)).to.be.equal("");
	});

	test("To Minute From Secode TEST", () => {
		expect(toMinuteFromSecode(60)).to.be.equal(1);
		expect(toMinuteFromSecode(30)).to.be.equal(1);
		expect(toMinuteFromSecode(5)).to.be.equal(1);

		expect(toMinuteFromSecode(120)).to.be.equal(2);
		expect(toMinuteFromSecode(119)).to.be.equal(2);

		expect(toMinuteFromSecode(121)).to.be.equal(3);
	});

	test("Random TEST", () => {
		const num1: number = randomInteger(0 , 2);
		expect(num1).to.be.least(0).that.most(2);

		const num2: number = randomInteger(4, 15);
		expect(num2).to.be.least(4).that.most(15);
	});

});
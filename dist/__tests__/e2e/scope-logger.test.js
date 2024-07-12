"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
const globals_1 = require("@jest/globals");
describe("scope-logger", () => {
    describe("given an array function inside a function call", () => {
        it("should log: array fn -> main fn", () => {
            const logger = new index_1.NodeLogger("Log tester", {
                entryPoint: "Object.toLogStdoutMatcher",
            });
            function testFn() {
                const testArr = [1, 2, 3];
                testArr.forEach((number) => {
                    logger.log({ number });
                });
            }
            //w/ JSON.stringify(_, _, 2) for logBody
            const expectedStr = `Log tester: *Array.forEach* -> *testFn*` +
                "\n" +
                "{\n" +
                '  "number": 1\n' +
                "}\n" +
                "\n" +
                `Log tester: *Array.forEach* -> *testFn*` +
                "\n" +
                "{\n" +
                '  "number": 2\n' +
                "}\n" +
                "\n" +
                `Log tester: *Array.forEach* -> *testFn*` +
                "\n" +
                "{\n" +
                '  "number": 3\n' +
                "}\n" +
                "\n";
            //Object.toLogStdoutMatcher
            (0, globals_1.expect)(testFn).toLogStdout(expectedStr);
        });
    });
    describe("given a nested function inside a function call", () => {
        it("should log: inner fn -> outer fn", () => {
            const logger = new index_1.NodeLogger("Log tester");
            function testFn() {
                function inner_testFn() {
                    const testVari = 123;
                    logger.log({ testVari }, { entryPoint: "Object.toLogStdoutMatcher" });
                }
                inner_testFn();
            }
            const expectedStr = "Log tester: *inner_testFn* -> *testFn*" +
                "\n" +
                "{" +
                "\n" +
                '  "testVari": 123' +
                "\n" +
                "}" +
                "\n" +
                "\n";
            (0, globals_1.expect)(testFn).toLogStdout(expectedStr);
        });
    });
    describe("given a nested array function inside an array function call", () => {
        it("should log: inner array fn -> outer array fn -> main fn", () => {
            const logger = new index_1.NodeLogger("Log tester", {
                entryPoint: "Object.toLogStdoutMatcher",
            });
            const testOuterArr = [1, 2, 3];
            const testInnerArr = [1, 2, 3];
            function testFn() {
                testOuterArr.map((_) => {
                    testInnerArr.forEach((testVari) => {
                        logger.log({ testVari });
                    });
                });
            }
            const outerRepeat = testOuterArr.length;
            const innerRepeat = testInnerArr.length;
            const ttlRepeat = outerRepeat * innerRepeat;
            let expectedStr = "";
            const expectedLogCall = "Log tester: *Array.forEach* -> *Array.map* -> *testFn*" + "\n";
            const expectedLogBody = (printVal) => {
                return ("{" + "\n" + `  "testVari": ${printVal}` + "\n" + "}" + "\n" + "\n");
            };
            let innerCount = 0;
            for (let i = 0; i < ttlRepeat; i++) {
                if (innerCount === innerRepeat) {
                    //reset
                    innerCount = 0;
                }
                expectedStr += expectedLogCall + expectedLogBody(++innerCount);
            }
            (0, globals_1.expect)(testFn).toLogStdout(expectedStr);
        });
    });
});

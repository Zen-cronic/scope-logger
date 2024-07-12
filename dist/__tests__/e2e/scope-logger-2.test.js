"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
const globals_1 = require("@jest/globals");
describe("scope-logger", () => {
    function fn_3() {
        const logger = new index_1.NodeLogger("Log tester");
        const testOuterArr = [1, 2, 3];
        const testInnerArr = [1, 2, 3];
        testOuterArr.map((num) => {
            testInnerArr.forEach((num) => {
                const { logTitle: result } = logger.log({ num });
                process.stderr.write(result + "\n");
            });
        });
    }
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
    describe("2) given a nested function inside a function call", () => {
        it("should log: inner fn -> outer fn", async () => {
            function testFn() {
                const logger = new index_1.NodeLogger("Log tester");
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
    describe("3) given a nested array function inside an array function call", () => {
        it("should log: inner array fn -> outer array fn -> main fn", async () => { });
    });
});

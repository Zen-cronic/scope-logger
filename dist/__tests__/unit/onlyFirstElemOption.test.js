"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
const globals_1 = require("@jest/globals");
describe("onlyFirstElem option", () => {
    describe("1) given n number of nested array functions", () => {
        it("should log only the first element; the outer arrays are ignored recursively", () => {
            const logger = new index_1.Logger("Log tester", {
                onlyFirstElem: true,
                entryPoint: "Object.toLogStdoutMatcher",
            });
            function testFn() {
                const universeArr = [1, 2, 3];
                const spaceArr = [1, 2, 3];
                const outerArr = [1, 2, 3];
                const middleArr = [1, 2, 3];
                const innerArr = [1, 2, 3];
                universeArr.map(() => {
                    spaceArr.forEach(() => {
                        outerArr.map(() => {
                            middleArr.forEach(() => {
                                innerArr.map((num) => {
                                    //only once
                                    logger.log({ num });
                                });
                            });
                        });
                    });
                });
            }
            const expected = "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *testFn*\n" +
                "{\n" +
                '  "num": 1\n' +
                "}\n" +
                "\n";
            (0, globals_1.expect)(testFn).toLogStdout(expected);
        });
    });
    describe("2) given the same instance of the log method is called on a different variable without any options", () => {
        it("should log the other variable with default options: onlyFirstElem = false", async () => {
            function testFn() {
                const logger = new index_1.Logger("Log tester");
                const testOuter = [1, 2, 3];
                const testInner = [1, 2, 3];
                testOuter.forEach(() => {
                    testInner.map((num_1) => {
                        logger.log({ num_1 }, { onlyFirstElem: true, entryPoint: "Object.toLogStdoutMatcher" });
                    });
                });
                const testAnotherArr = new Uint8Array(3);
                testAnotherArr.forEach((num_2) => {
                    logger.log({ num_2 }, { entryPoint: "Object.toLogStdoutMatcher" });
                });
            }
            const expectedFirstCall = "Log tester: *Array.map* -> *Array.forEach* -> *testFn*" +
                "\n" +
                "{\n" +
                '  "num_1": 1\n' +
                "}\n" +
                "\n";
            const expectedSecondCall = [1, 2, 3].reduce((acc, _) => {
                const logCallAndBody = "Log tester: *Uint8Array.forEach* -> *testFn*" +
                    "\n" +
                    "{\n" +
                    `  "num_2": 0\n` +
                    "}\n" +
                    "\n";
                acc += logCallAndBody;
                return acc;
            }, "");
            const expectedStr = expectedFirstCall + expectedSecondCall;
            (0, globals_1.expect)(testFn).toLogStdout(expectedStr);
        });
    });
});

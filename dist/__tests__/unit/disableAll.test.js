"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
const globals_1 = require("@jest/globals");
describe("disableAll() method", () => {
    describe("1) given that disableAll() is called directly on an instance", () => {
        it("should log nothing", () => {
            const logger = new index_1.NodeLogger("Log tester");
            let logResult = {};
            function testFn() {
                logger.disableAll();
                const foo = "bar";
                const logReturn = logger.log({ foo });
                logResult = { ...logReturn };
            }
            (0, globals_1.expect)(testFn).toLogStdout("");
            //logResult assigned only after the abv assertion
            (0, globals_1.expect)(logResult).toStrictEqual({
                stack: null,
                logTitle: null,
                logBody: null,
            });
        });
    });
    describe("2) given that disableAll() is called on the constructor (indirectly on the instance)", () => {
        it("should log nothing", () => {
            const logger = new index_1.NodeLogger("Log tester").disableAll();
            let logResult = {};
            function testFn() {
                const foo = "bar";
                const logReturn = logger.log({ foo });
                logResult = { ...logReturn };
            }
            (0, globals_1.expect)(testFn).toLogStdout("");
            (0, globals_1.expect)(logResult).toStrictEqual({
                stack: null,
                logTitle: null,
                logBody: null,
            });
        });
    });
    describe("3) given that the log method is called by the instance after invoking disableAll() on the constructor", () => {
        it("should NOT throw", () => {
            const logger = new index_1.NodeLogger("Log tester").disableAll();
            let logResult = {};
            function testFn() {
                const foo = "bar";
                const logReturn = logger.log({ foo });
                logResult = { ...logReturn };
            }
            (0, globals_1.expect)(testFn).toLogStdout("");
            (0, globals_1.expect)(logResult).toStrictEqual({
                stack: null,
                logTitle: null,
                logBody: null,
            });
        });
    });
});

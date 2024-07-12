"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
const globals_1 = require("@jest/globals");
describe("scope-logger", () => {
    function fn_2() {
        const logger = new index_1.NodeLogger("Log tester");
        function inner_fn_2() {
            const testVari = 123;
            const { logTitle: result } = logger.log({ testVari });
            process.stderr.write(result + "\n");
            // "Log tester: *inner_fn_2* -> *fn_2* -> *Object.<anonymous>*\n");
        }
        inner_fn_2();
    }
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
        it("should log: array fn -> main fn", async () => {
            const logger = new index_1.NodeLogger("Log tester", {
                entryPoint: "Object.toLogStdoutMatcher",
            });
            const expected = `Log tester: *Array.forEach* -> *fn_1*` +
                "\n" +
                "{\n" +
                '  "number": 1\n' +
                "}\n" +
                "\n" +
                `Log tester: *Array.forEach* -> *fn_1*` +
                "\n" +
                "{\n" +
                '  "number": 2\n' +
                "}\n" +
                "\n" +
                `Log tester: *Array.forEach* -> *fn_1*` +
                "\n" +
                "{\n" +
                '  "number": 3\n' +
                "}\n" +
                "\n";
            function fn_1() {
                const testArr = [1, 2, 3];
                testArr.forEach((number) => {
                    //the log method uses stdout
                    logger.log({ number });
                });
            }
            //Object.toLogStdoutMatcher
            (0, globals_1.expect)(fn_1).toLogStdout(expected);
        });
    });
    describe("2) given a nested function inside a function call", () => {
        it("should log: inner fn -> outer fn", async () => { });
    });
    describe("3) given a nested array function inside an array function call", () => {
        it("should log: inner array fn -> outer array fn -> main fn", async () => { });
    });
});

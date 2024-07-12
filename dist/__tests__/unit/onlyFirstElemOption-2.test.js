"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-to-log");
const index_1 = require("../../index");
describe("onlyFirstElem option", () => {
    function fn_1() {
        const logger = new index_1.NodeLogger("Log tester");
        let stackPrintCount = 0;
        const universeArr = [1, 2, 3];
        const spaceArr = [1, 2, 3];
        const outerArr = [1, 2, 3];
        const middleArr = [1, 2, 3];
        const innerArr = [1, 2, 3];
        const allArr = [
            universeArr,
            spaceArr,
            outerArr,
            middleArr,
            innerArr,
        ];
        let length = 1;
        for (let i = 0; i < allArr.length; i++) {
            length = length * allArr[i].length;
        }
        universeArr.map(() => {
            spaceArr.forEach(() => {
                outerArr.map(() => {
                    middleArr.forEach(() => {
                        innerArr.map((num) => {
                            //only once
                            const { logTitle: result, stack } = logger.log({ num }, { onlyFirstElem: true });
                            // "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *fn_1*\n";
                            process.stderr.write(result + "\n");
                            stackPrintCount++;
                            if (stackPrintCount <= 1) {
                            }
                        });
                    });
                });
            });
        });
    }
    function fn_2() {
        const logger = new index_1.NodeLogger("Log tester");
        const testOuter = [1, 2, 3];
        const testInner = [1, 2, 3];
        testOuter.forEach(() => {
            testInner.map((integer) => {
                const { logTitle: result } = logger.log({ integer }, { onlyFirstElem: true });
                process.stderr.write(result + "\n");
            });
        });
        const testAnotherArr = new Int8Array(3);
        testAnotherArr.forEach((integer) => {
            const { logTitle: result } = logger.log({ integer });
            process.stderr.write(result + "\n");
        });
        //"Log tester: *Array.map* -> *Array.forEach* -> *fn_1* -> *Object.<anonymous>*\n +
        //Log tester: "Int8Array.map" -> *fn_1*\n"; x length
    }
    describe("1) given n number of nested array functions", () => {
        it("should log only the first element; the outer arrays are ignored recursively", async () => {
            const expected = "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *fn_1*\n" +
                "null\n".repeat(1);
        });
    });
    describe("2) given the same instance of the log method is called on a different variable without any options", () => {
        it("should log the other variable with default options: onlyFirstElem = false", async () => {
            const expected = "Log tester: *Array.map* -> *Array.forEach* -> *fn_2*\n" +
                "Log tester: *Int8Array.forEach* -> *fn_2*\n".repeat(1);
        });
    });
});

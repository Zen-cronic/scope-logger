"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const logCallerLineChecker_1 = __importDefault(require("../../utils/logCallerLineChecker"));
const testHelper_1 = require("../../utils/testHelper");
describe("logCallerLineChecker func", () => {
    //ts: 2
    //js: 3
    const fileExt = (0, testHelper_1.determineFileExt)(__filename);
    const currentLogCallerLine = fileExt === "ts" ? 2 : 3;
    // const currentLogCallerLine = 2
    describe("given a call stack is provided", () => {
        it("should return the index of the line containing the main log func call", () => {
            // at NodeLogger._createErrorStack ()
            // at NodeLogger.log ()
            // at Object.<anonymous> ()
            // at Promise.then.completed ()
            const logger = new index_1.NodeLogger("Test", {
                entryPoint: "Promise.then.completed",
            });
            const foo = "bar";
            const logInfo = logger.log({ foo });
            const result = (0, logCallerLineChecker_1.default)(logInfo.stack);
            expect(result).toBe(currentLogCallerLine);
        });
    });
    describe("given a call stack is provided inside a function in the test suite", () => {
        it("should return the index of the line containing the main log func call", () => {
            // at NodeLogger._createErrorStack ()
            // at NodeLogger.log ()
            // at testWrapper ()
            // at Object.<anonymous> ()
            // at Promise.then.completed ()
            const testWrapper = () => {
                const logger = new index_1.NodeLogger("Test", {
                    entryPoint: "Promise.then.completed",
                });
                const bar = "foo";
                const logInfo = logger.log({ bar });
                const result = (0, logCallerLineChecker_1.default)(logInfo.stack);
                expect(result).toBe(currentLogCallerLine);
            };
            testWrapper();
        });
    });
});

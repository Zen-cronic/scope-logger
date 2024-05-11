"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const logCallerLineChecker_1 = __importDefault(require("../../utils/logCallerLineChecker"));
describe("logCallerLineChecker func", () => {
    const currentLogCallerLine = 2;
    describe("given a call stack is provided", () => {
        it("should return the index of the line containing the main log func call", () => {
            // at NodeLogger.captureStackTrace [as log] (C:...)
            //   at log (C:...)
            //NOT NodeLogger.log
            const logger = new index_1.NodeLogger("Test");
            const foo = "bar";
            const logInfo = logger.log({ foo });
            const result = (0, logCallerLineChecker_1.default)(logInfo.stack);
            expect(result).toBe(currentLogCallerLine);
        });
    });
    describe("given a call stack is provided inside a function in the test suite", () => {
        it("should return the index of the line containing the main log func call", () => {
            // at NodeLogger.captureStackTrace [as log] (C:...)
            // at log (C:...)
            // at Object.testWrapper (C:...)
            const testWrapper = () => {
                const logger = new index_1.NodeLogger("Test");
                const bar = "foo";
                const logInfo = logger.log({ bar });
                const result = (0, logCallerLineChecker_1.default)(logInfo.stack);
                expect(result).toBe(currentLogCallerLine);
            };
            testWrapper();
        });
    });
});

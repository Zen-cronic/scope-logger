"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
const logCallerLineChecker_1 = __importDefault(require("../../utils/logCallerLineChecker"));
describe("logCallerLineChecker func", () => {
    //ts: 2
    //js: 3
    let currentLogCallerLine;
    (async () => {
        const currentFileName = __filename;
        const isTS = currentFileName.endsWith(".ts");
        const isJS = currentFileName.endsWith(".ts");
        if (isTS) {
            currentLogCallerLine = 2;
        }
        else if (isJS) {
            currentLogCallerLine = 3;
        }
        else {
            throw new Error(`Only Javascript or Typescript files allowed. Received file "${currentFileName}" of type "${path_1.default.extname(currentFileName)}"`);
        }
    })();
    describe("given a call stack is provided", () => {
        it("should return the index of the line containing the main log func call", () => {
            // at Logger._createErrorStack ()
            // at Logger.log ()
            // at Object.<anonymous> ()
            // at Promise.then.completed ()
            const logger = new index_1.Logger("Test", {
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
            // at Logger._createErrorStack ()
            // at Logger.log ()
            // at testWrapper ()
            // at Object.<anonymous> ()
            // at Promise.then.completed ()
            const testWrapper = () => {
                const logger = new index_1.Logger("Test", {
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

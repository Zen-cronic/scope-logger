"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
describe("immutability and configurability of option arguments", () => {
    const testArr = [1, 2, 3, 4, 5];
    describe("given that a NodeLogger instance is created with options", () => {
        it("should NOT allow options to be set by the log func", () => {
            const logger = new index_1.NodeLogger("Test", {
                ignoreIterators: true,
                onlyFirstElem: true,
            });
            expect(() => {
                testArr.forEach((num) => {
                    logger.log({ num }, { ignoreIterators: false });
                });
            }).toThrow(/^Cannot redefine _options if the instance is created with options$/);
        });
        it("logger instances should retain the original option values", () => {
            const logger = new index_1.NodeLogger("Test", {
                ignoreIterators: true,
                onlyFirstElem: true,
            });
            expect(() => {
                testArr.forEach((num) => {
                    logger.log({ num });
                });
            }).not.toThrow();
            expect(logger._options).toStrictEqual({
                ignoreIterators: true,
                onlyFirstElem: true,
            });
        });
    });
    describe("given that a NodeLogger instance is NOT created with options", () => {
        it("should allow options to be set by the log func", () => {
            const logger = new index_1.NodeLogger("Test");
            expect(() => {
                testArr.map((num) => {
                    logger.log({ num }, { ignoreIterators: true, onlyFirstElem: true });
                });
            }).not.toThrow();
            expect(logger._options).toStrictEqual({
                ignoreIterators: true,
                onlyFirstElem: true,
            });
        });
        it("should allow reconfiguration of the options by the same instance", () => {
            const logger = new index_1.NodeLogger("Test");
            expect(() => {
                testArr.map((num) => {
                    logger.log({ num }, { ignoreIterators: true });
                    logger.log({ num }, { ignoreIterators: false, onlyFirstElem: true });
                });
            }).not.toThrow();
            expect(logger._options).toStrictEqual({
                ignoreIterators: false,
                onlyFirstElem: true,
            });
        });
        it("missing options provided to the instance must use default values", () => {
            const logger = new index_1.NodeLogger("Test");
            const defaultOptions = index_1.NodeLogger.defaultOptions;
            expect(logger._options).toStrictEqual(defaultOptions);
            //missing one option
            testArr.map((num) => {
                logger.log({ num }, { ignoreIterators: true });
            });
            expect(logger._options).toStrictEqual({
                ...defaultOptions,
                ignoreIterators: true,
            });
            //all options provided
            testArr.map((num) => {
                logger.log({ num }, { ignoreIterators: false, onlyFirstElem: true });
            });
            expect(logger._options).toStrictEqual({
                ...defaultOptions,
                ignoreIterators: false,
                onlyFirstElem: true,
            });
            //turn back missing to default
            testArr.map((num) => {
                logger.log({ num }, { ignoreIterators: true });
            });
            expect(logger._options).toStrictEqual({
                ...defaultOptions,
                ignoreIterators: true,
                onlyFirstElem: false,
            });
            //turn back all to default
            testArr.map((num) => {
                logger.log({ num });
            });
            expect(logger._options).toStrictEqual(defaultOptions);
        });
    });
});

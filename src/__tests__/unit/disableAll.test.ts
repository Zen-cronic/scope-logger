import "jest-to-log";
import { Logger } from "../../index";
import { expect } from "@jest/globals";

describe("disableAll() method", () => {
  describe("1) given that disableAll() is called directly on an instance", () => {
    it("should log nothing", () => {
      const logger = new Logger("Log tester");

      let logResult = {};

      function testFn() {
        logger.disableAll();

        const foo = "bar";
        const logReturn = logger.log({ foo });

        logResult = { ...logReturn };
      }

      expect(testFn).toLogStdout("");

      //logResult assigned only after the abv assertion
      expect(logResult).toStrictEqual({
        stack: null,
        logTitle: null,
        logBody: null,
      });
    });
  });

  describe("2) given that disableAll() is called on the constructor (indirectly on the instance)", () => {
    it("should log nothing", () => {
      const logger = new Logger("Log tester").disableAll();

      let logResult = {};

      function testFn() {
        const foo = "bar";
        const logReturn = logger.log({ foo });
        logResult = { ...logReturn };
      }
      expect(testFn).toLogStdout("");

      expect(logResult).toStrictEqual({
        stack: null,
        logTitle: null,
        logBody: null,
      });
    });
  });
  describe("3) given that the log method is called by the instance after invoking disableAll() on the constructor", () => {
    it("should NOT throw", () => {
      const logger = new Logger("Log tester").disableAll();
      let logResult = {};

      function testFn() {
        const foo = "bar";
        const logReturn = logger.log({ foo });
        logResult = { ...logReturn };
      }

      expect(testFn).toLogStdout("");
      expect(logResult).toStrictEqual({
        stack: null,
        logTitle: null,
        logBody: null,
      });
    });
  });
});

import "jest-to-log";
import { NodeLogger } from "../../index";
import { expect } from "@jest/globals";

describe("scope-logger", () => {
  describe("given an array function inside a function call", () => {
    it("should log: array fn -> main fn", () => {
      const logger = new NodeLogger("Log tester", {
        entryPoint: "Object.toLogStdoutMatcher",
      });
      const testArr = [1, 2, 3];

      function testFn() {
        testArr.forEach((number) => {
          logger.log({ number });
        });
      }

      //w/ JSON.stringify(_, _, 2) for logBody
      const expectedStr: string = testArr.reduce((accStr, currNum) => {
        const logContent =
          `Log tester: *Array.forEach* -> *testFn*` +
          "\n" +
          "{\n" +
          `  "number": ${currNum}\n` +
          "}\n" +
          "\n";

        accStr += logContent;
        return accStr;
      }, "");

      //Object.toLogStdoutMatcher
      expect(testFn).toLogStdout(expectedStr);
    });
  });

  describe("given a nested function inside a function call", () => {
    it("should log: inner fn -> outer fn", () => {
      const logger = new NodeLogger("Log tester");
      function testFn() {
        function inner_testFn() {
          const testVari = 123;
          logger.log({ testVari }, { entryPoint: "Object.toLogStdoutMatcher" });
        }
        inner_testFn();
      }

      const expectedStr =
        "Log tester: *inner_testFn* -> *testFn*" +
        "\n" +
        "{" +
        "\n" +
        '  "testVari": 123' +
        "\n" +
        "}" +
        "\n" +
        "\n";
      expect(testFn).toLogStdout(expectedStr);
    });
  });

  describe("given a nested array function inside an array function call", () => {
    it("should log: inner array fn -> outer array fn -> main fn", () => {
      const logger = new NodeLogger("Log tester", {
        entryPoint: "Object.toLogStdoutMatcher",
      });

      const testOuterArr = [1, 2, 3];
      const testInnerArr = [1, 2, 3];

      function testFn() {
        testOuterArr.map((_) => {
          testInnerArr.forEach((testVari) => {
            logger.log({ testVari });
          });
        });
      }

      const expectedNumArr: number[][] = [];

      for (let i = 0; i < testOuterArr.length; i++) {
        expectedNumArr.push(testInnerArr);
      }
      const expectedStr: string = expectedNumArr
        .flatMap((arr) => {
          return arr;
        })
        .reduce((accStr, currNum) => {
          const logContent =
            "Log tester: *Array.forEach* -> *Array.map* -> *testFn*" +
            "\n" +
            "{" +
            "\n" +
            `  "testVari": ${currNum}` +
            "\n" +
            "}" +
            "\n" +
            "\n";

          accStr += logContent;
          return accStr;
        }, "");

      expect(testFn).toLogStdout(expectedStr);
    });
  });
});

import "jest-to-log";
import { NodeLogger } from "../../index";
import { expect } from "@jest/globals";

describe("scope-logger", () => {
  describe("given an array function inside a function call", () => {
    it("should log: array fn -> main fn", () => {
      const logger = new NodeLogger("Log tester", {
        entryPoint: "Object.toLogStdoutMatcher",
      });
      function testFn() {
        const testArr = [1, 2, 3];

        testArr.forEach((number) => {
          logger.log({ number });
        });
      }

      //w/ JSON.stringify(_, _, 2) for logBody
      const expectedStr =
        `Log tester: *Array.forEach* -> *testFn*` +
        "\n" +
        "{\n" +
        '  "number": 1\n' +
        "}\n" +
        "\n" +
        `Log tester: *Array.forEach* -> *testFn*` +
        "\n" +
        "{\n" +
        '  "number": 2\n' +
        "}\n" +
        "\n" +
        `Log tester: *Array.forEach* -> *testFn*` +
        "\n" +
        "{\n" +
        '  "number": 3\n' +
        "}\n" +
        "\n";

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

      const outerRepeat: number = testOuterArr.length;
      const innerRepeat: number = testInnerArr.length;
      const ttlRepeat: number = outerRepeat * innerRepeat;

      let expectedStr = "";

      const expectedLogCall =
        "Log tester: *Array.forEach* -> *Array.map* -> *testFn*" + "\n";

      const expectedLogBody = (printVal: number) => {
        return (
          "{" + "\n" + `  "testVari": ${printVal}` + "\n" + "}" + "\n" + "\n"
        );
      };

      let innerCount = 0;
      for (let i = 0; i < ttlRepeat; i++) {
        if (innerCount === innerRepeat) {
          //reset
          innerCount = 0;
        }
        expectedStr += expectedLogCall + expectedLogBody(++innerCount);
      }

      expect(testFn).toLogStdout(expectedStr);
    });
  });
});

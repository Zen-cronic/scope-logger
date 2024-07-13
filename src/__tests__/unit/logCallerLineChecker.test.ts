import { NodeLogger } from "../../index";
import { LogReturn } from "../../logger";
import { FileExt } from "../../types";
import logCallerLineChecker from "../../utils/logCallerLineChecker";
import { determineFileExt } from "../../utils/testHelper";

describe("logCallerLineChecker func", () => {
  //ts: 2
  //js: 3
  const fileExt: FileExt = determineFileExt(__filename);
  const currentLogCallerLine = fileExt === "ts" ? 2 : 3;
  // const currentLogCallerLine = 2

  describe("given a call stack is provided", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at NodeLogger._createErrorStack ()
      // at NodeLogger.log ()
      // at Object.<anonymous> ()
      // at Promise.then.completed ()

      const logger = new NodeLogger("Test", {
        entryPoint: "Promise.then.completed",
      });

      const foo = "bar";
      const logInfo: LogReturn = logger.log({ foo });

      const result: number = logCallerLineChecker(logInfo.stack as string);

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
        const logger = new NodeLogger("Test", {
          entryPoint: "Promise.then.completed",
        });
        const bar = "foo";
        const logInfo: LogReturn = logger.log({ bar });

        const result: number = logCallerLineChecker(logInfo.stack as string);
        expect(result).toBe(currentLogCallerLine);
      };
      testWrapper();
    });
  });
});

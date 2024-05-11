import { NodeLogger } from "../../index";
import logCallerLineChecker from "../../utils/logCallerLineChecker";

describe("logCallerLineChecker func", () => {
  const currentLogCallerLine: number = 2;

  describe("given a call stack is provided", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at NodeLogger.captureStackTrace [as log] (C:...)
      //   at log (C:...)
      //NOT NodeLogger.log

      const logger = new NodeLogger("Test");

      const foo = "bar";
      const logInfo = logger.log({ foo });

      const result = logCallerLineChecker(logInfo.stack as string);

      expect(result).toBe(currentLogCallerLine);
    });
  });

  describe("given a call stack is provided inside a function in the test suite", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at NodeLogger.captureStackTrace [as log] (C:...)
      // at log (C:...)
      // at Object.testWrapper (C:...)

      const testWrapper = () => {
        const logger = new NodeLogger("Test");
        const bar = "foo";
        const logInfo = logger.log({ bar });

        const result = logCallerLineChecker(logInfo.stack as string);
        expect(result).toBe(currentLogCallerLine);
      };
      testWrapper();
    });
  });
});

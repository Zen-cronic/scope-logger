const { Logger } = require("../../index");
const { logCallerLineChecker } = require("../../utils/logCallerLineChecker");

describe("logCallerLineChecker func", () => {
  const currentLogCallerLine = 2;

  describe("given a call stack is provided", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at Logger.captureStackTrace [as log] (C:...)
      //   at log (C:...)
      //NOT Logger.log

      const logger = new Logger();

      const foo = "bar";
      const logInfo = logger.log({ foo });

      const result = logCallerLineChecker(logInfo.stack);

      expect(result).toBe(currentLogCallerLine);
    });
  });

  describe("given a call stack is provided inside a function in the test suite", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at Logger.captureStackTrace [as log] (C:...)
      // at log (C:...)
      // at Object.testWrapper (C:...)

      const testWrapper = () => {
        const logger = new Logger();
        const bar = "foo";
        const logInfo = logger.log({ bar });

        const result = logCallerLineChecker(logInfo.stack);
        expect(result).toBe(currentLogCallerLine);
      };
      testWrapper();
    });
  });
});

import { NodeLogger } from "../../index";
// import { NodeLogger } from "../../node";
import { LogReturn } from "../../logger";
import { FileExt } from "../../types";
import logCallerLineChecker from "../../utils/logCallerLineChecker";
import { determineFileExt } from "../../utils/testHelper";

describe("logCallerLineChecker func", () => {
  //ts: 2
  //js: 3
  const fileExt: FileExt = determineFileExt(__filename)
  const currentLogCallerLine = fileExt === "ts" ? 2 : 3

  describe("given a call stack is provided", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at NodeLogger.captureStackTrace [as log] (C:...)
      //   at log (C:...)
      //NOT NodeLogger.log

      //revmp:
      // at NodeLogger._createErrorStack ()
      // at NodeLogger.log () 
      // at Object.<anonymous> ()
      // at Promise.then.completed ()

      const logger = new NodeLogger("Test");

      const foo = "bar";
      const logInfo: LogReturn = logger.log({ foo });

      console.log('====================================');
      console.log(logInfo.stack);
      console.log('====================================');

      const result: number = logCallerLineChecker(logInfo.stack as string);

      expect(result).toBe(currentLogCallerLine);
    });
  });

  describe("given a call stack is provided inside a function in the test suite", () => {
    it("should return the index of the line containing the main log func call", () => {
      // at NodeLogger.captureStackTrace [as log] (C:...)
      // at log (C:...)
      // at Object.testWrapper (C:...)

      // revmp:
      // at NodeLogger._createErrorStack ()
      // at NodeLogger.log () 
      // at testWrapper ()
      // at Object.<anonymous> ()
      // at Promise.then.completed ()

      const testWrapper = () => {
        const logger = new NodeLogger("Test");
        const bar = "foo";
        const logInfo: LogReturn= logger.log({ bar });

        // console.log('====================================');
        // console.log(logInfo.stack);
        // console.log('====================================');

        const result: number = logCallerLineChecker(logInfo.stack as string);
        expect(result).toBe(currentLogCallerLine);
      };
      testWrapper();
    });
  });
});

import path from "path";
import { NodeLogger } from "../../index";
import { LogReturn } from "../../logger";
import logCallerLineChecker from "../../utils/logCallerLineChecker";

describe("logCallerLineChecker func", () => {
  //ts: 2
  //js: 3
  let currentLogCallerLine: number;

  (async () => {
    const currentFileName = __filename;
    const isTS = currentFileName.endsWith(".ts");
    const isJS = currentFileName.endsWith(".ts");

    if (isTS) {
      currentLogCallerLine = 2;
    } else if (isJS) {
      currentLogCallerLine = 3;
    } else {
      throw new Error(
        `Only Javascript or Typescript files allowed. Received file "${currentFileName}" of type "${path.extname(
          currentFileName
        )}"`
      );
    }
  })();

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

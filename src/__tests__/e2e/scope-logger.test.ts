import { WorkerNonErrorMessage } from "../../types";
import {  setupTest } from "../../utils/testHelper";

describe("scope-logger", () => {
  const { createMessagePromise, createWorkerDataPromise } = setupTest(
    "e2e",
    "scope-logger.test.process.ts"
    // "scope-logger.test.process.js"

  );
  /**
   *
   * @param {string} expectedResult
   * @param {boolean} [waitMessageFromWorker=false]
   */

  
  async function runTestCase(
    expectedResult: string,
    waitMessageFromWorker: boolean = false
  ) {
    let promises: (Promise<string> | Promise<WorkerNonErrorMessage>)[] = [
      createWorkerDataPromise(),
    ];

    if (waitMessageFromWorker) {
      promises.push(createMessagePromise());
    }

    const promisesResult = await Promise.all(promises);

    const workerData = promisesResult[0];
    const message = promisesResult[1];

    const { length = 1 } = message || {};
    if (typeof length !== "number") {
      throw new Error(`Invalid length from child process: ${length}`);
    }

    const discolouredResult = (workerData as string).replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    expectedResult = expectedResult.repeat(length);
    expect(discolouredResult).toBe(expectedResult);
  }

  describe("1) given an array function inside a function call", () => {
    it("should log: array fn -> main fn", async () => {
      try {
        const expected = `Log tester: *Array.forEach* -> *fn_1*\n`;

        await runTestCase(expected, true);
      } catch (error: any) {
        throw new Error(error);
      }
    });
  });

  describe("2) given a nested function inside a function call", () => {
    it("should log: inner fn -> outer fn", async () => {
      try {
        const expected = `Log tester: *inner_fn_2* -> *fn_2*\n`;

        await runTestCase(expected);
      } catch (error: any) {
        throw new Error(error);
      }
    });
  });

  describe("3) given a nested array function inside an array function call", () => {
    it("should log: inner array fn -> outer array fn -> main fn", async () => {
      try {
        const expected = `Log tester: *Array.forEach* -> *Array.map* -> *fn_3*\n`;

        await runTestCase(expected, true);
      } catch (error: any) {
        throw new Error(error);
      }
    });
  });
});

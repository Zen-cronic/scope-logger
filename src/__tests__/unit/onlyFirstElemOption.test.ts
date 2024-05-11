import { WorkerNonErrorMessage } from "../../types";
import { setupTest } from "../../utils/testHelper";

describe("onlyFirstElem option", () => {
  const { createMessagePromise, createWorkerDataPromise } = setupTest(
    "unit",
    "onlyFirstElemOption.test.process.ts"
  );

  /**
   *
   * @param {boolean} [removeNullAndN=false]
   * @returns {Promise<{length: number;discolouredResult: string;}>}
   */
  async function processWorkerPromises(removeNullAndN?: boolean): Promise<{
    length: number;
    discolouredResult: string;
  }> {
    let promises: (Promise<string> | Promise<WorkerNonErrorMessage>)[] = [
      createWorkerDataPromise(),
      createMessagePromise(),
    ];

    const promisesResult = await Promise.all(promises);

    let workerData = promisesResult[0];
    if (removeNullAndN) {
      workerData = (workerData as string).replace(/null\n/g, "");
    }
    const message = promisesResult[1];

    const { length = 1 } = message || {};
    if (typeof length !== "number") {
      throw new Error(`Invalid length from child process: ${length}`);
    }

    const discolouredResult = (workerData as string).replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    return { length, discolouredResult };
  }

  describe("1) given n number of nested array functions", () => {
    it("should log only the first element; the outer arrays are ignored recursively", async () => {
      const { length, discolouredResult } = await processWorkerPromises();

      const expected =
        "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *fn_1*\n" +
        "null\n".repeat(length);

      expect(discolouredResult).toBe(expected);
    });
  });

  describe("2) given the same instance of the log method is called on a different variable without any options", () => {
    it("should log the other variable with default options: onlyFirstElem = false", async () => {
      const { length, discolouredResult } = await processWorkerPromises(true);

      const expected =
        "Log tester: *Array.map* -> *Array.forEach* -> *fn_2*\n" +
        "Log tester: *Int8Array.forEach* -> *fn_2*\n".repeat(length);

      expect(discolouredResult).toBe(expected);
    });
  });
});

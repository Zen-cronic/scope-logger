const { setupTest } = require("../../utils/testHelper");

describe("disableAll() method", () => {
  const { createMessagePromise, createWorkerDataPromise } = setupTest(
    "unit",
    "disableAll.test.process.js"
  );

  /**
   *
   * @param {boolean} [removeNullAndN=false]
   * @returns {Promise<{length: number;discolouredResult: string;}>}
   */
  async function processWorkerPromises(removeNullAndN) {
    // let promises = [createWorkerDataPromise(), createMessagePromise()];

    // const promisesResult = await Promise.all(promises);

    // let workerData = promisesResult[0];
    // if (removeNullAndN) {
    //   workerData = workerData.replace(/null\n/g, "");
    // }

    // const message = promisesResult[1];

    const promiseResult = await createWorkerDataPromise();
    const workerData = promiseResult;

    // const { length = 1 } = message || {};
    // if (typeof length !== "number") {
    //   throw new Error(`Invalid length from child process: ${length}`);
    // }

    const discolouredResult = workerData.replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    // return { length, discolouredResult };
    return { discolouredResult };
  }

  describe("1) given that disableAll() is called directly on an instance", () => {
    it("should log nothing", async () => {
      const { length, discolouredResult } = await processWorkerPromises();

      const expected = "";

      expect(discolouredResult).toBe(expected);
    });
  });

  describe("2) given that disableAll() is called on the constructor (indirectly on the instance)", () => {
    it("should log nothing", async () => {
      const { length, discolouredResult } = await processWorkerPromises(true);

      const expected = "";
      expect(discolouredResult).toBe(expected);
    });
  });
  describe("3) given that the log method is called after invoking disableAll() on the constructor", () => {
    it("should NOT throw", async () => {
      expect(async () => await processWorkerPromises()).not.toThrow();
    });
  });
});

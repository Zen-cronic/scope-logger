const { setupTest } = require("../../utils/testHelper");

describe("disableAll() method", () => {
  const { createWorkerDataPromise } = setupTest(
    "unit",
    "disableAll.test.process.js"
  );

  /**
   *
   * Only createWorkerDataPromise; Nu createMessagePromise
   * @returns {Promise<{discolouredResult: string}>}
   */
  async function processWorkerPromises() {
    
    const promiseResult = await createWorkerDataPromise();
    const workerData = promiseResult;

    const discolouredResult = workerData.replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    return { discolouredResult };
  }

  describe("1) given that disableAll() is called directly on an instance", () => {
    it("should log nothing", async () => {
      const { discolouredResult } = await processWorkerPromises();

      //just \n
      const expected = "\n";

      expect(discolouredResult).toBe(expected);
    });
  });

  describe("2) given that disableAll() is called on the constructor (indirectly on the instance)", () => {
    it("should log nothing", async () => {
      const {  discolouredResult } = await processWorkerPromises();

      const expected = "\n";
      expect(discolouredResult).toBe(expected);
    });
  });
  describe("3) given that the log method is called after invoking disableAll() on the constructor", () => {
    it("should NOT throw", async () => {
      expect(async () => await processWorkerPromises()).not.toThrow();
    });
  });
});

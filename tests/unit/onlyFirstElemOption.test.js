const { join } = require("path");
const { fork } = require("child_process");

describe("onlyFirstElem option", () => {
  const testProcessPath = join(
    __dirname,
    ".",
    "onlyFirstElemOption.test.process.js"
  );

  let workerProcess;
  let testCaseNum = 0;

  function createWorkerDataPromise() {
    return new Promise((resolve, reject) => {
      let data = "";

      workerProcess.stderr.on("data", (chunk) => {
        data += chunk;
      });

      workerProcess.stderr.on("end", () => {
        resolve(data);
      });

      workerProcess.stderr.on("error", reject);
    });
  }

  function createMessagePromise() {
    return new Promise((resolve, reject) => {
      workerProcess.on("error", reject);

      //once | on - either way, dependent on worker
      workerProcess.once("message", (message) => {
        if (message?.error) {
          reject(new Error(message.error));
        }
        resolve(message);
      });
    });
  }

  /**
   *
   * @param {boolean} [removeNullAndN=false]
   * @returns {Promise<{length: number;discolouredResult: string;}>}
   */
  async function processWorkerPromises(removeNullAndN) {
    let promises = [createWorkerDataPromise(), createMessagePromise()];

    const promisesResult = await Promise.all(promises);

    let workerData = promisesResult[0];
    if (removeNullAndN) {
      workerData = workerData.replace(/null\n/g, "");
    }
    const message = promisesResult[1];

    const { length = 1 } = message || {};
    if (typeof length !== "number") {
      throw new Error(`Invalid length from child process: ${length}`);
    }

    const discolouredResult = workerData.replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    return { length, discolouredResult };
  }

  beforeEach(() => {
    workerProcess = fork(testProcessPath, {
      stdio: [0, "pipe", "pipe", "ipc"],
    });

    testCaseNum++;

    workerProcess.send(testCaseNum);

    workerProcess.stderr.pipe(process.stderr, { end: false });
  });

  describe("1) given n number of nested array functions", () => {
    it("should log only the first element; the outer arrays are ignored recursively", async () => {

      const {length , discolouredResult} = await processWorkerPromises()

      const expected =
        "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *fn_1*\n" +
        "null\n".repeat(length);

      expect(discolouredResult).toBe(expected);
    });
  });

  describe("2) given the same instance of the log method is called on a different variable without any options", () => {
    it("should log the other variable with default options: onlyFirstElem = false", async () => {
    
      const {length , discolouredResult} = await processWorkerPromises(true)

      const expected =
        "Log tester: *Array.map* -> *Array.forEach* -> *fn_2*\n" +
        "Log tester: *Int8Array.forEach* -> *fn_2*\n".repeat(length);

      expect(discolouredResult).toBe(expected);
    });
  });
});

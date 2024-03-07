const { join } = require("path");
const { fork } = require("child_process");

describe("callStackParser function", () => {
  function setInitialLogCall() {
    function isProcessDefined() {
      return typeof process === "undefined" ? false : true;
    }

    if (isProcessDefined()) {
      return "*process.processTicksAndRejections*";
    } else {
      return "*processTicksAndRejections*";
    }
  }

  const initialLogCall = setInitialLogCall();

  const testProcessPath = join(
    __dirname,
    ".",
    "callStackParser.test.process.js"
  );

  let workerProcess;
  let testCaseNum = 0;

  function createWorkerDataPromise() {
    return new Promise((resolve, reject) => {
      let data = "";

      workerProcess.stderr.on("data", (chunk) => {
        // console.log(`Wroker stderr: ${chunk}`);
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
      workerProcess.on("message", (message) => {
        if (message?.error) {
          reject(new Error(message.error));
        }
        resolve(message);
      });
    });
  }

  /**
   *
   * @param {string} expectedResult
   * @param {boolean} [waitMessageFromWorker=false]
   */
  async function runTestCase(expectedResult, waitMessageFromWorker = false) {
    let promises = [createWorkerDataPromise()];

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

    const discolouredResult = workerData.replace(
      /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
      ""
    );

    expectedResult = expectedResult.repeat(length);
    expect(discolouredResult).toBe(expectedResult);
  }

  beforeEach(() => {
    workerProcess = fork(testProcessPath, {
      stdio: [0, "pipe", "pipe", "ipc"],
    });

    testCaseNum++;

    workerProcess.send(testCaseNum);

    workerProcess.stderr.pipe(process.stderr, { end: false });
  });

  describe("1) given an array function inside a function call", () => {
    it("should log: array fn -> main fn", async () => {
      try {
        const expected = `Log tester: *Array.forEach* -> *fn_1* -> ${initialLogCall}\n`;

        await runTestCase(expected, true);
      } catch (error) {
        throw new Error(error);
      }
    });
  });

  describe("2) given a nested function inside a function call", () => {
    it("should log: inner fn -> outer fn", async () => {
      try {
        const expected = `Log tester: *inner_fn_2* -> *fn_2* -> ${initialLogCall}\n`;

        await runTestCase(expected);
      } catch (error) {
        throw new Error(error);
      }
    });
  });

  describe("3) given a nested array function inside an array function call", () => {
    it("should log: inner array fn -> outer array fn -> main fn", async () => {
      try {
        const expected = `Log tester: *Array.forEach* -> *Array.map* -> *fn_3* -> ${initialLogCall}\n`;

        await runTestCase(expected, true);
      } catch (error) {
        throw new Error(error);
      }
    });
  });
});

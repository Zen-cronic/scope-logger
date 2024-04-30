//repeated setup + beforeEach
const { join } = require("path");
const { fork } = require("child_process");
const { existsSync } = require("fs");

module.exports = {
  setupTest,
};

/**
 * Sets up the test environment.
 * @param {...string} processFilePath - The path(s) to the test process file(s).
 */
function setupTest(...processFilePath) {
  const testProcessPath = join(__dirname, "..", "tests", ...processFilePath);

  if (!existsSync(testProcessPath)) {
    console.log("testProcessPath DNE");
    throw new Error(
      `Specified test process path DOES NOT EXIST: ${testProcessPath}`
    );
  }

  let workerProcess;
  let testCaseNum = 0;

  /**
   * Creates worker process
   * @param {string} testProcessPath
   */
  function createProcess(testProcessPath) {
    if (typeof testProcessPath !== "string" || !existsSync(testProcessPath)) {
      throw new Error("Test Process Path Does Not Exist");
    }

    workerProcess = fork(testProcessPath, {
      stdio: [0, "pipe", "pipe", "ipc"],

      env: Object.assign({}, process.env, { NODE_ENV: "test" }),
    });

    testCaseNum++;

    workerProcess.send(testCaseNum);

    workerProcess.stderr.pipe(process.stderr, { end: false });
  }

  /**
   * Creates data by worker
   * @returns {Promise<string>}
   * @throws {Error}
   */
  function createWorkerDataPromise() {
    return new Promise((resolve, reject) => {
      let data = "";

      workerProcess.stderr.on("data", (chunk) => {
        data += chunk;
      });

      workerProcess.stderr.once("end", () => {
        resolve(data);
      });

      workerProcess.stderr.once("error", reject);
    });
  }

  /**
   * Retrieves message sent by worker
   * @returns {Promise<{length: number} | {error: string}>}
   * @throws {Error} When the worker process exits with a non-zero code, or if no message is received from the worker process within the timeout period.
   */
  function createMessagePromise() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for message from worker process"));
      }, 1000);

      workerProcess.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      workerProcess.once("message", (message) => {
        clearTimeout(timeout);

        if (message?.error) {
          reject(new Error(message.error));
        }
        resolve(message);
      });

      workerProcess.once("exit", (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          //worker default length:0
          resolve({ length: 0 });
        }

        reject(new Error(`Worker process exited with code ${code}`));
      });
    });
  }

  beforeEach(() => {
    createProcess(testProcessPath);
  });

  return { createMessagePromise, createWorkerDataPromise };
}

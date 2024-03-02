const { join } = require("path");
const { fork } = require("child_process");

describe("callStackParser function", () => {
  describe("given a nested function with array function call", () => {
    it("should log the call stack function names in order", async () => {
      const testProcessPath = join(
        __dirname,
        ".",
        "callStackParser.test.process.js"
      );

      //stderr for child process testing
      //stdout for logging

      const workerProcess = fork(testProcessPath, {
        stdio: [0, "pipe", "pipe", "ipc"],
      });

      workerProcess.stderr.pipe(process.stderr, { end: false });

      try {
        const workerDataPromise = new Promise((resolve, reject) => {
          let data = "";

          workerProcess.stderr.on("data", (chunk) => {
            data += chunk;
          });

          workerProcess.stderr.on("end", () => {
            resolve(data);
          });

          workerProcess.stderr.on("error", reject);
        });

        const messagePromise = new Promise((resolve, reject) => {
          workerProcess.on("error", reject);

          workerProcess.on("message", (message) => {
            if (message?.error) {
              reject(new Error(message.error));
            }
            resolve(message);
          });
        });

        const [workerData, message] = await Promise.all([
          workerDataPromise,
          messagePromise,
        ]);
        const { length } = message;
        if (typeof length !== "number") {
          throw new Error(`Invalid length from child process: ${length}`);
        }

        const expected =
          "Log tester: *Array.forEach* -> *testOuterFn* -> *Object.<anonymous>*\n".repeat(
            length
          );

        const discolouredResult = workerData.replace(
          /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
          ""
        );
        expect(discolouredResult).toBe(expected);
      } catch (error) {
        // console.error(error);
        throw new Error(error);
      }
    });
  });
});

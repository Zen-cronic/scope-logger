const { join } = require("path");
const { fork } = require("child_process");

describe.skip("callStackParser function", () => {
  const testProcessPath = join(
    __dirname,
    ".",
    "callStackParser.test.process.js"
  );

  describe("1) given a nested function with array function call", () => {
    it("should log the call stack function names in order", async () => {
      try {
        const workerProcess = fork(testProcessPath, {
          stdio: [0, "pipe", "pipe", "ipc"],
        });
        console.log(`Spawned worker pid: ${workerProcess.pid}`);

        const testCaseNum = 1;
        //async
        workerProcess.send(testCaseNum);
        // await new Promise((resolve, reject) => {
        //   workerProcess.send(testCaseNum, (error) => {
        //     if (error) {
        //       reject(error);
        //     } else {
        //       resolve();
        //     }
        //   });
        //   workerProcess.on("error", (error) => {
        //     // reject(error);
        //     reject(new Error(error))
        //   });
        // });

        workerProcess.stderr.pipe(process.stderr, { end: false });
        // workerProcess.stdout.pipe(process.stdout, {end:false})
        const workerDataPromise = new Promise((resolve, reject) => {
          let data = "";

          workerProcess.stderr.on("data", (chunk) => {
            data += chunk;
          });

          workerProcess.stderr.on("end", () => {
            // console.log("resolved data on end: ", data);
            resolve(data);
          });

          workerProcess.stderr.on("error", reject);
        });

        const messagePromise = new Promise((resolve, reject) => {
          workerProcess.on("error", reject);

          //once | on - either way, dependent on worker
          workerProcess.on("message", (message) => {
            if (message?.error) {
              reject(new Error(message.error));
            }
            resolve(message);
          });

          // resolve({length: 3})
        });

        const [workerData, message] = await Promise.all([
          workerDataPromise,
          messagePromise,
        ]);
        const { length = null } = message;
        if (typeof length !== "number") {
          throw new Error(`Invalid length from child process: ${length}`);
        }

        const expected =
          //   "Log tester: *Array.forEach* -> *fn_1* -> *process.processTicksAndRejections*\n".repeat(
          "Log tester: *Array.forEach* -> *fn_1* -> *Object.<anonymous>*\n".repeat(
            length
          );

        const discolouredResult = workerData.replace(
          /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
          ""
        );
        expect(discolouredResult).toBe(expected);
      } catch (error) {
        // console.error(error); //no failure in jest
        throw new Error(error);
      }
    });
  });

  //   describe("2) given a nested function with function call", () => {
  //     it("should log the call stack function names in order", async () => {
  //       try {
  //         const workerData = await new Promise((resolve, reject) => {
  //           let data = "";

  //           workerProcess.stderr.on("data", (chunk) => {
  //             data += chunk;
  //           });

  //           workerProcess.stderr.on("end", () => {
  //             resolve(data);
  //           });

  //           workerProcess.stderr.on("error", reject);
  //         });

  //         const expected =
  //           "Log tester: *inner_fn_2* -> *fn_2* -> *process.processTicksAndRejections*\n";

  //         //received - first case
  //         //  + Log tester: *Array.forEach* -> *fn_1* -> *Object.<anonymous>* X3
  //         const discolouredResult = workerData.replace(
  //           /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
  //           ""
  //         );
  //         expect(discolouredResult).toBe(expected);
  //       } catch (error) {
  //         throw new Error(error);
  //       }
  //     });
  //   });
});

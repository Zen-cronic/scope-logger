const { join } = require("path");
const { fork } = require("child_process");

describe.skip("callStackParser function", () => {
  let testCaseNum = 1;
  let workerProcess = null

  const testProcessPath = join(
    __dirname,
    ".",
    "callStackParser.test.js"
  );

  //stderr for child process testing
  //stdout for logging

  beforeEach(async () => {
    
    try {
      workerProcess = fork(testProcessPath, {
        stdio: [0, "pipe", "pipe", "ipc"],
      });
      console.log(`Spawned worker pid: ${workerProcess.pid}`);
  
      //async
      // workerProcess.send(testCaseNum);
  
      await new Promise((resolve, reject) => {
        workerProcess.send(testCaseNum, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
        workerProcess.on("error", (error) => {
          reject(error)
        })
      });
    
      workerProcess.stderr.pipe(process.stderr, { end: false });
    } catch (error) {
      throw new Error(error.message)
    }
    
  });

  afterEach(() => {
    testCaseNum++;

    // return new Promise((resolve, reject) => {
    //   workerProcess.on("exit", (code) => {
    //     console.log(`Worker process exited ${code}`);

    //     //0 - success
    //     if (code) {
    //       reject("Unsuccessful exit");
    //     }
    //     resolve();
    //   });
    // });
  });

  
  describe("1) given a nested function with array function call", () => {
    it("should log the call stack function names in order", async () => {
      try {
        const workerDataPromise = new Promise((resolve, reject) => {
          let data = "";

          workerProcess.stderr.on("data", (chunk) => {
            data += chunk;
          });

          workerProcess.stderr.on("end", () => {
            console.log("resolved data on end: ", data);
            resolve(data);
          });

          workerProcess.stderr.on("error", reject);
        })

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
          "Log tester: *Array.forEach* -> *fn_1* -> *process.processTicksAndRejections*\n".repeat(
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

  describe("2) given a nested function with function call", () => {
    it("should log the call stack function names in order", async () => {
      try {
        const workerData = await new Promise((resolve, reject) => {
          let data = "";

          workerProcess.stderr.on("data", (chunk) => {
            data += chunk;
          });

          workerProcess.stderr.on("end", () => {
            resolve(data);
          });

          workerProcess.stderr.on("error", reject);
        });

        const expected =
          "Log tester: *inner_fn_2* -> *fn_2* -> *process.processTicksAndRejections*\n";

        //received - first case
        //  + Log tester: *Array.forEach* -> *fn_1* -> *Object.<anonymous>* X3
        const discolouredResult = workerData.replace(
          /(\x1b\[\d+;\d+m)|(\x1b\[\d+m)/g,
          ""
        );
        expect(discolouredResult).toBe(expected);
      } catch (error) {
        throw new Error(error);
      }
    });
  });
});


//repeated setup + beforeEach
const { join } = require("path");
const { fork } = require("child_process");

module.exports = {
    setupTest
};


/**
 * Sets up the test environment.
 * @param {...string} processFilePath - The path(s) to the test process file(s).
 */
function setupTest(...processFilePath){

    const testProcessPath = join(
        __dirname,
        "..",
        "tests",
        ...processFilePath
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
 
      beforeEach(() => {
        workerProcess = fork(testProcessPath, {
          stdio: [0, "pipe", "pipe", "ipc"],
        });
    
        testCaseNum++;
    
        workerProcess.send(testCaseNum);
    
        workerProcess.stderr.pipe(process.stderr, { end: false });

      });
    
      return {createMessagePromise, createWorkerDataPromise}
}
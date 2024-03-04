const { Logger } = require("../../logger");

//stderr for child process testing
//stdout for logging

(async function () {
  try {
    let testCaseNumFromParent = 0;

    // async setting of testCaseNumFromParent
    testCaseNumFromParent = await new Promise((resolve, reject) => {
      process.on("message", (message) => {
        if (typeof message === "number") {
          console.error("message from parent: " + message);
          //   testCaseNumFromParent = message;
          resolve(message);
        } else {
          // reject();
          reject(new Error("Hi error"));
        }
      });
    });
    console.error("testCaseNumFromParent: ", testCaseNumFromParent);

    async function fn_1() {
      const logger = new Logger("Log tester");

      const testArr = [1, 2, 3];

      testArr.forEach((number) => {
        const { logTitle: result } = logger.log({ number });

        //forked - own stream
        // console.error(result);
        //or
        process.stderr.write(result + "\n");

        // "Log tester: *Array.forEach* -> *fn_1* -> *Object.<anonymous>*\n");
      });

      await new Promise((resolve, reject) => {
        process.send({ length: testArr.length }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    function fn_2() {
      const logger = new Logger("Log tester");
      function inner_fn_2() {
        const testVari = 123;
        const { logTitle: result } = logger.log({ testVari });

        process.stderr.write(result + "\n");

        // "Log tester: *inner_fn_2* -> *fn_2* -> *Object.<anonymous>*\n");
      }

      inner_fn_2();
    }

    try {
      switch (testCaseNumFromParent) {
        case 1:
          //Worker:Logger: *Array.forEach* -> *f1* -> *process.processTicksAndRejections* ->
          await fn_1();
          break;

        case 2:
          //Worker:f2: *inner_fn_2* -> *f2* -> *process.processTicksAndRejections*
          fn_2();
          break;

        default:
          break;
      }
    } catch (error) {
      process.send({ error: error.message });
    }
  } catch (error) {
    process.send({ error: error.message });
  }
})();

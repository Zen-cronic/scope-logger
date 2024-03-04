const { Logger } = require("../../logger");
const logger = new Logger("Log tester");

(async function () {
  try {
    function fn_1() {
      const testArr = [1, 2, 3];

      testArr.forEach((number) => {
          //the log method uses stdout, so this worker's stdout can be piped to main's
        const { logTitle: result, stack } = logger.log({ number });

        // console.error("stack: ", stack);

        //forked - own stream
        // console.error(result);
        //or
        process.stderr.write(result + "\n");
        // process.stderr.end() //error: end after write
      });

      process.send({ length: testArr.length });
      // process.exit();
    }

    //when process.exit()
    //Log tester: *Array.forEach* -> *fn_1* -> *process.<anonymous>* -> *process.emit* -> *emit* -> *process.processTicksAndRejections*
    // await new Promise((resolve, reject) => {
    //   process.on("message", (message) => {
    //     if (typeof message === "number") {
    //       console.log("message from parent: " + message);
    //       //   testCaseNumFromParent = message;

    //       resolve(fn_1());
    //       // fn_1();
    //       // process.exit();
    //     } else {
    //       reject();
    //     }
    //   });
    // });

    //must be awaited
    process.once("message", (message) => {
      if (typeof message === "number") {
        console.log("message from parent: " + message);
        // process.stderr.write("message from parent: " + message);

        // message from parent: 1Log tester: *Array.forEach* -> *fn_1* -> *process.<anonymous>* -> *Object.onceWrapper* -> *process.emit* -> *emit* -> *process.processTicksAndRejections*
        fn_1();
        process.exit()
      }
    });
    // fn_1();
    // process.exit();
  } catch (error) {
    // Send the error message to the parent process
    process.send({ error: error.message });
  }
})();

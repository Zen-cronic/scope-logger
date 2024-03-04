const { Logger } = require("../../logger");
const logger = new Logger("Log tester");

(async function () {
  try {

    let testCaseNum = 0

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

    //when process.exit()
    //Log tester: *Array.forEach* -> *fn_1* -> *process.<anonymous>* -> *process.emit* -> *emit* -> *process.processTicksAndRejections*
    testCaseNum = await new Promise((resolve, reject) => {
      process.once("message", (message) => {
        if (typeof message === "number") {
          console.log("message from parent: " + message);
          //   testCaseNumFromParent = message;

          
          // fn_1();
          // process.exit();
            resolve(message)
        } else {
          reject(0);
        }
      });
    });

    //must be awaited
    // process.once("message", (message) => {
    //   if (typeof message === "number") {
    //     console.log("message from parent: " + message);
    //     // process.stderr.write("message from parent: " + message);

    //     // message from parent: 1Log tester: *Array.forEach* -> *fn_1* -> *process.<anonymous>* -> *Object.onceWrapper* -> *process.emit* -> *emit* -> *process.processTicksAndRejections*
    //     // fn_1();
    //     // process.exit()

    //   }
    // });

    switch (testCaseNum) {
        case 1:
            
            fn_1()
            break;
    
        case 2:
            
            fn_2()
            break;
    
        default:
            break;
    }

    process.exit()
    // fn_1();
    // process.exit();
  } catch (error) {
    // Send the error message to the parent process
    process.send({ error: error.message });
  }
})();

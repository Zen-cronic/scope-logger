import { NodeLogger } from "../../index";
import { NonNullProcessSend } from "../../types";

const logger = new NodeLogger("Log tester");


(async function () {
  try {
    function fn_1() {
      const testArr = [1, 2, 3];

      testArr.forEach((number) => {
        //the log method uses stdout
        const { logTitle: result, stack } = logger.log({ number });

        process.stderr.write(result + "\n");
      });

      (process.send as NonNullProcessSend)({
        length: testArr.length,
      });
    }

    function fn_2() {
      const logger = new NodeLogger("Log tester");
      function inner_fn_2() {
        const testVari = 123;
        const { logTitle: result } = logger.log({ testVari });

        process.stderr.write(result + "\n");

        // "Log tester: *inner_fn_2* -> *fn_2* -> *Object.<anonymous>*\n");

      }

      inner_fn_2();
    }

    function fn_3() {
      const logger = new NodeLogger("Log tester");

      const testOuterArr = [1, 2, 3];

      const testInnerArr = [1, 2, 3];

      testOuterArr.map((num) => {
        testInnerArr.forEach((num) => {
          const { logTitle: result } = logger.log({ num });

          process.stderr.write(result + "\n");
        });
      });

      // process.stderr.write(testOuterArr.length * testInnerArr.length)
      (process.send as NonNullProcessSend)({
        length: testOuterArr.length * testInnerArr.length,
      });
    }

    //when process.exit()
    const testCaseNum = await new Promise((resolve, reject) => {
      process.once("message", (message) => {
        if (typeof message === "number") {
          console.log("message from parent: " + message);

          resolve(message);
        } else {
          reject(new Error("Invalid test case sent from main process"));
        }
      });
    });

    switch (testCaseNum) {
      case 1:
        fn_1();
        break;

      case 2:
        fn_2();
        break;
      case 3:
        fn_3();
        break;

      default:
        break;
    }
  } catch (error: any) {
    // Send the error message to the parent process
    (process.send as NonNullProcessSend)({ error: (error as Error).message });
  }
})();

import { NodeLogger } from "../../index";
import { NonNullProcessSend } from "../../types";

(async function () {
  try {
    //instance
    function fn_1() {
      const logger = new NodeLogger("Log tester");

      logger.disableAll();

      const foo = "bar";
      const { logTitle: result } = logger.log({ foo });

      process.stderr.write(result + "\n");
    }

    //constructor
    function fn_2() {
      const logger = new NodeLogger("Log tester").disableAll();
      const foo = "bar";
      const { logTitle: result } = logger.log({ foo });

      process.stderr.write(result + "\n");
    }

    //not throw
    function fn_3() {
      const logger = new NodeLogger("Log tester").disableAll();
      
      const foo = "bar";
      const { logTitle: result } = logger.log({ foo });

      process.stderr.write(result + "\n");
    }

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

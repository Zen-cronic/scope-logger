const { Logger } = require("../../index");

const logger = new Logger("Log tester");

(async function () {

  try {
    
    function fn_1() {
      const logger = new Logger("Log tester");

      let stackPrintCount = 0;

      const universeArr = [1, 2, 3];
      const spaceArr = [1, 2, 3];
      const outerArr = [1, 2, 3];
      const middleArr = [1, 2, 3];
      const innerArr = [1, 2, 3];

      const allArr = [universeArr,spaceArr, outerArr, middleArr, innerArr]

      let length = 1
      for(let i = 0; i< allArr.length; i++){
        length = length * allArr[i].length 
      }

      universeArr.map(() => {
        spaceArr.forEach(() => {
          outerArr.map(() => {
            middleArr.forEach(() => {
              innerArr.map((num) => {

                //only once
                const { logTitle: result, stack } = logger.log(
                  { num },
                  { onlyFirstElem: true }
                );

                // "Log tester: *Array.map* -> *Array.forEach* -> *Array.map* -> *Array.forEach* -> *Array.map* -> *fn_1*\n";

                process.stderr.write(result + "\n");

                stackPrintCount++;
                if (stackPrintCount <= 1) {
                  // console.error({stack})
                }
              });
            });
          });
        });
      });

      process.send({ length: length -1 });
    }

    function fn_2() {
      const logger = new Logger("Log tester");

      const testOuter = [1, 2, 3];
      const testInner = [1, 2, 3];

      testOuter.forEach(() => {
        testInner.map((integer) => {
          const { logTitle: result } = logger.log(
            { integer },
            { onlyFirstElem: true }
          );

          process.stderr.write(result + "\n");
        });
      });

      const testAnotherArr = new Int8Array(3);

      testAnotherArr.forEach((integer) => {
        const { logTitle: result } = logger.log({ integer });

        process.stderr.write(result + "\n");
      });

      //"Log tester: *Array.map* -> *Array.forEach* -> *fn_1* -> *Object.<anonymous>*\n +
      //Log tester: "Int8Array.map" -> *fn_1*\n"; x length

      process.send({ length: testAnotherArr.length });
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

      default:
        break;
    }
  } catch (error) {
    process.send({ error: error.message });
  }
})();

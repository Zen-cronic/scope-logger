const { Logger } = require("../../logger");

const logger = new Logger("Log tester");

//stderr for child process testing
//stdout for logging
try {
  function testOuterFn() {
    const testArr = [1, 2, 3];

    testArr.forEach((number) => {
      const { logTitle: result } = logger.log({ number });

      //forked - own stream
      // console.error(result);
      //or
      process.stderr.write(result + "\n");

      // "Log tester: *Array.forEach* -> *testOuterFn* -> *Object.<anonymous>*\n");
    });

    process.send({ length: testArr.length });
  }

  testOuterFn();
  console.log("child func called");
} catch (error) {
  // Send the error message to the parent process
  process.send({ error: error.message });
}

const { Logger } = require("../../logger");

const logger = new Logger("Log tester");

//stderr for child process testing 
//stdout for logging 

const testOuterFn = () => {
  const testArr = [1, 2, 3];

  testArr.forEach((number) => {
    const { logTitle: result } = logger.log({ number });

    //writes to child process's stream, returned as arg to exec()

    // console.error(result);
    //or
    process.stderr.write(result + "\n");

    //   "Log tester: _Array.forEach -> _Array.some -> _nestedArr -> Object.<anonymous>"
    // );

    
  });
  // process.stdout.write('\x1Bc');
};

testOuterFn();

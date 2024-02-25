const { Logger } = require("../../logger");

const logger = new Logger("Log tester");

const testOuterFn = () => {
  const testArr = [1, 2, 3];

  testArr.forEach((number) => {
    const { logTitle: result } = logger.log({ number });
//    return result
console.log(result);

// process.stdout.write(result + "\n")
    //   "Log tester: _Array.forEach_ -> _Array.some_ -> _nestedArr_ -> _Object.<anonymous>_ -> "
    // );
  });
};

testOuterFn();

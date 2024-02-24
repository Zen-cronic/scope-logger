const LOGGER_CLASS = "Logger";
const LOG_FUNCTION = "log";
const LOG_LINE_IDENTIFIER = LOGGER_CLASS + "." + LOG_FUNCTION;

//for splitIndex in callStackParser
/**
 * @param {string} callStack
 * @returns
 */
function logCallerLineChecker(callStack) {
  const callStackParts = callStack.split("\n");

  //for main program
  // at Logger.log (C:...)
  const oneLiner = callStackParts.findIndex(
    (line) => line.trim().split(" ")[1] === LOG_LINE_IDENTIFIER
  );
  console.log("oneLiner: ", oneLiner);

  if (oneLiner === -1) {
    // const firstLine = callStackParts.findIndex(
    //     (line) => line.trim().split(" ")[1].split(".")[0] === LOGGER_CLASS
    //   )

    const secondLine = callStackParts.findIndex((line) => {
      // console.log("secondLine split: ", line);
      // console.log("secondLine split: ")
      //true
      // console.log(  line.trim().split(" ")[1] === LOG_FUNCTION);
      // console.log("LOG FUNC: ", LOG_FUNCTION);

      return line.trim().split(" ")[1] === LOG_FUNCTION;
    });

    // console.log("secondLine: ", secondLine);

    if (secondLine === -1) {
      const secondLineFunc = callStackParts.findIndex((line) => {
        return line.trim().split(" ")[1]?.split(".")[1] === LOG_FUNCTION;
      });

      if (secondLineFunc === -1) {
        throw new Error("Call stack not found");
      }
      return secondLineFunc;
    }
    return secondLine;
  }

  return oneLiner;
  //test suite check
  //  at Logger.captureStackTrace [as log] (C:...)
  //   at log (C:...)

  //class name
  //consecutive should be log func
}

module.exports = {
  logCallerLineChecker,
};

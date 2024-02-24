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

  //3 cases
  //1) program: Logger.log
  //2) testwrapper: log
  //3) no testwrapper: Object.log

  const oneLiner = callStackParts.findIndex(
    (line) => line.trim().split(" ")[1] === LOG_LINE_IDENTIFIER
  );
  // console.log("oneLiner: ", oneLiner);

  if (oneLiner === -1) {
    // confirm with firstLine too?
    // const firstLine = callStackParts.findIndex(
    //     (line) => line.trim().split(" ")[1].split(".")[0] === LOGGER_CLASS
    //   )

    const secondLine = callStackParts.findIndex((line) => {
      return line.trim().split(" ")[1] === LOG_FUNCTION;
    });

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
}

module.exports = {
  logCallerLineChecker,
};

const LOGGER_CLASS = "Logger";
const LOG_FUNCTION = "log";
const LOG_LINE_IDENTIFIER = LOGGER_CLASS + "." + LOG_FUNCTION;
/**
 * For splitIndex in callStackParser.
 * Three cases:
 * 1) program: Logger.log
 * 2) testwrapper: log
 * 3) no testwrapper: Object.log
 * @param {string} callStack
 * @returns {number}
 */
export default function logCallerLineChecker(callStack) {
    const callStackParts = callStack.split("\n");
    const oneLiner = callStackParts.findIndex((line) => getFunctionIdentifier(line) === LOG_LINE_IDENTIFIER);
    if (oneLiner === -1) {
        const twoLiner = callStackParts.findIndex((line) => {
            return getFunctionIdentifier(line) === LOG_FUNCTION;
        });
        if (twoLiner === -1) {
            const secondLineFunc = callStackParts.findIndex((line) => {
                const functionIdentifier = getFunctionIdentifier(line);
                if (functionIdentifier) {
                    return functionIdentifier.split(".")[1] === LOG_FUNCTION;
                }
            });
            if (secondLineFunc === -1) {
                throw new Error("Call stack not found");
            }
            return secondLineFunc;
        }
        return twoLiner;
    }
    return oneLiner;
}
/**
 *
 * @param {string} line
 * @returns {string | undefined}
 */
function getFunctionIdentifier(line) {
    return line.trim().split(" ")[1];
}

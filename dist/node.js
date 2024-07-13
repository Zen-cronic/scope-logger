"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLogger = void 0;
const logger_1 = require("./logger");
const logCallerLineChecker_1 = __importDefault(require("./utils/logCallerLineChecker"));
class NodeLogger extends logger_1.Logger {
    _writeLog(logTitle, logBody) {
        process.stdout.write(logTitle + "\n" + logBody + "\n\n");
    }
    _callStackParser(callStack) {
        const callStackParts = callStack.split("\n");
        const callStackPartsLen = callStackParts.length;
        //start loop from the line after log line
        const offset = 1;
        const delimiter = logger_1.Logger.logCallerDelimiter;
        let logLineIndex = (0, logCallerLineChecker_1.default)(callStack) + offset;
        let logTitle = "";
        for (; logLineIndex < callStackPartsLen; logLineIndex++) {
            const currentLine = callStackParts[logLineIndex];
            //at" "x" "y
            let currentLineParts = currentLine.trim().split(" ");
            if (!currentLine || currentLineParts[1] === this._options.entryPoint) {
                break;
            }
            //processTicksAndRejections (unix) | process.processTicksAndRejections
            if (currentLineParts[1] === "processTicksAndRejections" ||
                currentLineParts[1] === "process.processTicksAndRejections") {
                const lastOccurence = logTitle.indexOf(delimiter + "*" + currentLineParts[1] + "*" + delimiter);
                logTitle = logTitle.slice(0, lastOccurence);
                continue;
            }
            const currentLinePartsLen = currentLineParts.length;
            let calleeFunc = "";
            //4 - async | constructor
            //3 - normal func
            //2 - 1 abv iterable | anonymous func (at (location))
            if (currentLinePartsLen === 3) {
                calleeFunc = currentLineParts[1];
                //iterable func or normal func
                const [iterableType, _iterableFunc_] = calleeFunc.split(".");
                if (logger_1.Logger.NATIVE_ITERATORS_TYPES.includes(iterableType) &&
                    this._options.ignoreIterators) {
                    continue;
                }
            }
            else if (currentLinePartsLen === 4) {
                calleeFunc = currentLineParts[1] + " " + currentLineParts[2];
            }
            //2
            else {
                continue;
            }
            logTitle = logTitle.concat(`*${calleeFunc}*`, delimiter);
        }
        //trim cuz concat-ed before the entryPoint break
        logTitle = logTitle.trimEnd();
        const trimmedDelimiter = delimiter.trimEnd();
        if (logTitle.endsWith(trimmedDelimiter)) {
            logTitle = logTitle.slice(0, -trimmedDelimiter.length);
        }
        return logTitle;
    }
    _formatLogCall(logCall) {
        const { namespace } = this;
        const delimiter = logger_1.Logger.logCallerDelimiter;
        const colour = this._selectColour();
        const colourCode = "\x1b[1;3" + colour + "m";
        const colouredPrefixNamespace = `${colourCode}${namespace}\x1b[0m`;
        const colouredDelimiter = `${colourCode}${delimiter}\x1b[0m`;
        let colouredLog = logCall;
        if (namespace) {
            colouredLog = colouredPrefixNamespace + ": " + colouredLog;
        }
        colouredLog = colouredLog.replace(new RegExp(delimiter, "g"), colouredDelimiter);
        return colouredLog;
    }
    _selectColour() {
        const { namespace } = this;
        let numerator;
        let denominator = logger_1.Logger.colours.length;
        if (!namespace) {
            numerator = Math.floor(Math.random() * logger_1.Logger.colours.length);
        }
        else {
            let hash = 0;
            const namespaceLen = namespace.length;
            for (let i = 0; i < namespaceLen; i++) {
                hash += namespace.charCodeAt(i);
            }
            numerator = hash;
        }
        return logger_1.Logger.colours[numerator % denominator];
    }
    _createErrorStack() {
        const err = {};
        Error.stackTraceLimit = 100;
        Error.captureStackTrace(err);
        return err;
    }
    log(args, options) {
        //tmp sol
        const err = this._createErrorStack();
        const { stack: errorStack } = err;
        const earlyLog = this.earlyLog(errorStack, args, options);
        if (earlyLog) {
            return earlyLog;
        }
        else {
            const logTitle = this._formatLogCall(this._callStackParser(errorStack));
            const logBody = this._formatLogBody();
            this._writeLog(logTitle, logBody);
            const logReturn = Object.freeze({
                stack: err.stack,
                logTitle,
                logBody,
            });
            return logReturn;
        }
    }
}
exports.NodeLogger = NodeLogger;

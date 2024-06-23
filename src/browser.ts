import { IEnv, LogOptions, LogReturn, Logger } from "./logger";
import logCallerLineChecker from "./utils/logCallerLineChecker";

export class BrowserLogger extends Logger implements IEnv {
  _writeLog(logTitle: string, logBody: string) {
    console.log(logTitle + "\n" + logBody);
  }

  _callStackParser(callStack: string): string {
    const callStackParts = callStack.split("\n");
    const callStackPartsLen = callStackParts.length;

    //start loop from the line after log line
    const offset = 1;

    const delimiter = Logger.logCallerDelimiter;

    let logLineIndex = logCallerLineChecker(callStack) + offset;
    let logTitle = "";

    for (; logLineIndex < callStackPartsLen; logLineIndex++) {
      const currentLine = callStackParts[logLineIndex];

      //at" "x" "y
      let currentLineParts = currentLine.trim().split(" ");

      //instead of Module._compile: last React frame
      // if (!currentLine || currentLineParts[1] === "renderWithHooks") {

      // //cross browser
      if (!currentLine || currentLine.includes("renderWithHooks")) {
        break;
      }

      //processTicksAndRejections (unix) | process.processTicksAndRejections
      if (
        currentLineParts[1] === "processTicksAndRejections" ||
        currentLineParts[1] === "process.processTicksAndRejections"
      ) {
        const lastOccurence = logTitle.indexOf(
          delimiter + "*" + currentLineParts[1] + "*" + delimiter
        );

        logTitle = logTitle.slice(0, lastOccurence);

        continue;
      }

      const currentLinePartsLen = currentLineParts.length;

      let calleeFunc = "";

      //4 - async | constructor
      //3 - normal func
      //2 - 1 abv iterable | anonymous (at (location))
      if (currentLinePartsLen === 3) {
        calleeFunc = currentLineParts[1];

        //iterable func or normal func
        const [iterableType, iterableFunc] = calleeFunc.split(".");

        if (
          Logger.NATIVE_ITERATORS_TYPES.includes(iterableType) &&
          this._options.ignoreIterators
        ) {
          continue;
        }
      } else if (currentLinePartsLen === 4) {
        calleeFunc = currentLineParts[1] + " " + currentLineParts[2];
      }

      //2
      else {
        continue;
      }

      logTitle = logTitle.concat(`*${calleeFunc}*`, delimiter);
    }

    //" ->"
    const testEnvDelimiter = delimiter.trimEnd();

    //dev (or) prod - delimiter
    const checkDelimiter =
      process.env.NODE_ENV === "test" ? testEnvDelimiter : delimiter;

    if (logTitle.endsWith(checkDelimiter)) {
      logTitle = logTitle.slice(0, -checkDelimiter.length);
    }

    return logTitle;
  }

  _formatLogCall(logCall: string): string {
    const { namespace } = this;

    const delimiter = Logger.logCallerDelimiter;

    const colour = this._selectColour();

    const colourCode = "\x1b[1;3" + colour + "m";

    const colouredPrefixNamespace = `${colourCode}${namespace}\x1b[0m`;

    const colouredDelimiter = `${colourCode}${delimiter}\x1b[0m`;

    let colouredLog = logCall;

    if (namespace) {
      colouredLog = colouredPrefixNamespace + ": " + colouredLog;
    }

    colouredLog = colouredLog.replace(
      new RegExp(delimiter, "g"),
      colouredDelimiter
    );

    return colouredLog;
  }

  _formatLogContent(): string {
    const { args } = this;

    let logBody = JSON.stringify(
      args,
      (_, val) => {
        if (typeof val == "function") {
          return val.name + " :f()";
        } else if (typeof val == "undefined") {
          return "undefined";
        } else if (!val && typeof val == "object") {
          return "null";
        }

        return val;
      },
      2
    );

    logBody = logBody.replace(/(\{)|(\})/g, (match) => {
      return "\x1b[1;3" + Logger.colourNum.toString() + "m" + match + "\x1b[0m";
    });

    return logBody;
  }

  _selectColour(): number {
    const { namespace } = this;

    let numerator;
    let denominator = Logger.colours.length;

    if (!namespace) {
      numerator = Math.floor(Math.random() * Logger.colours.length);
    } else {
      let hash = 0;
      const namespaceLen = namespace.length;
      for (let i = 0; i < namespaceLen; i++) {
        hash += namespace.charCodeAt(i);
      }

      numerator = hash;
    }

    return Logger.colours[numerator % denominator];
  }

  _createErrorStack() {
    const err = new Error();

    return err as { stack: string };
  }

  log(args: Object, options?: LogOptions): LogReturn {
    //tmp sol
    const err = this._createErrorStack();
    const { stack: errorStack } = err;

    const earlyLog = this.earlyLog(errorStack, args, options);

    if (earlyLog) {
      return earlyLog;
    } else {
      const logTitle = this._formatLogCall(this._callStackParser(errorStack));
      const logBody = this._formatLogContent();

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

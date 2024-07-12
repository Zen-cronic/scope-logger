"use strict";

import logCallerLineChecker from "./utils/logCallerLineChecker";

// TC: same callStackParser implm except entry point function call
// _formatLogContent() is same implm for both browser and node

interface LogOptions {
  ignoreIterators?: boolean;
  onlyFirstElem?: boolean;
}

interface LogReturn {
  stack: string | null;
  logTitle: string | null;
  logBody: string | null;
}

interface IEnv {
  _writeLog(logTitle: string, logBody: string): void;
  _callStackParser(callStack: string): string;
  _formatLogCall(logCall: string): string;
  _formatLogContent(): string;
  _selectColour(): number;
  _createErrorStack(): { stack: string };
  log(args: Object, options?: LogOptions): LogReturn;
}

class Logger {
  static colours = [1, 2, 3, 4, 5, 6];
  static logCallerDelimiter = " -> ";

  static NATIVE_ITERATORS_TYPES = [
    "Array",
    "Map",
    "Set",
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "Uint32Array",
    "Float32Array",
    "Float64Array",
    "BigInt64Array",
    "BigUint64Array",
  ];

  static defaultOptions = Object.freeze({
    ignoreIterators: false,
    onlyFirstElem: false,
  });

  static colourNum: number = 7;

  args: Object | null;
  namespace: string;
  _options: LogOptions;
  firstElem: string | null;

  /**
   *
   * @param {string} namespace
   * @param {LogOptions} [options]
   */

  constructor(namespace: string, options?: LogOptions) {
    this.args = null;
    this.namespace = namespace;
    this._options = options || Object.assign({}, Logger.defaultOptions);
    this.firstElem = null;
    Logger.colourNum = this.#selectColour();

    if (options) {
      Object.defineProperty(this, "_options", {
        value: this._options,
        enumerable: true,
        configurable: false,
        writable: false,
      });
    }

    //args can change
    //_options may change
    //namespace cannot change

    Object.defineProperty(this, "namespace", {
      value: this.namespace,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  /**
   *
   * @param {Object} args
   * @param {LogOptions} [options]
   * @returns {LogReturn}
   */
  protected earlyLog(
    errorStack: string,
    args: Object,
    options?: LogOptions
  ): LogReturn | undefined {
    this.#validateArgs(args);

    this.#setOptions(options);

    this.args = args;

    // let logReturn = this.#handleOnlyFirstElem(err.stack);
    let logReturn = this.#handleOnlyFirstElem(errorStack);
    return logReturn;
  }

  /**
   * @param {string} stack
   * @returns {LogReturn | undefined}
   */
  #handleOnlyFirstElem(stack: string): LogReturn | undefined {
    if (this.firstElem === stack) {
      return Object.freeze({
        stack: null,
        logTitle: null,
        logBody: null,
      });
    }

    //flag to cmp following elems
    //for the first elem, set this.firstElem
    if (this._options.onlyFirstElem) {
      this.firstElem = stack;
    }
  }

  /**
   *
   * @param {Object} args
   */
  #validateArgs(args: Object) {
    if (
      typeof args !== "object" ||
      args === null ||
      Object.keys(args).length === 0
    ) {
      throw new TypeError("Must be a non-empty obj");
    }

    if (Object.keys(args).length !== 1) {
      throw new Error("Only 1 property allowed");
    }
  }

  /**
   *
   * @param {LogOptions} [options]
   */
  #setOptions(options?: LogOptions) {
    if (options) {
      try {
        this._options = Object.assign(
          {}, //or this._options //existing
          Logger.defaultOptions, //default
          options //passed
        );
      } catch (error: any) {
        const errorRe = /^Cannot assign to read only property .*/;

        if (error.name === "TypeError" && errorRe.test(error.message)) {
          throw new Error(
            "Cannot redefine _options in the instance if the constructor is called with options." +
              "\n" +
              "Already called with: " +
              JSON.stringify(this._options)
          );
        } else {
          throw error;
        }
      }
    } else {
      const propDesc = Object.getOwnPropertyDescriptor(this, "_options");

      //check whether already set by constructor
      if (propDesc?.configurable && propDesc?.writable) {
        this._options = Object.assign({}, Logger.defaultOptions);
      }
    }
  }

  /**
   *
   * @returns {number}
   */
  #selectColour(): number {
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

  // /**
  //  *
  //  * @param {string} callStack
  //  * @returns {string}
  //  */
  // #callStackParser(callStack: string): string {
  //   const callStackParts = callStack.split("\n");
  //   const callStackPartsLen = callStackParts.length;

  //   //start loop from the line after log line
  //   const offset = 1;

  //   const delimiter = Logger.logCallerDelimiter;

  //   let logLineIndex = logCallerLineChecker(callStack) + offset;
  //   let logTitle = "";

  //   for (; logLineIndex < callStackPartsLen; logLineIndex++) {
  //     const currentLine = callStackParts[logLineIndex];

  //     //at" "x" "y
  //     let currentLineParts = currentLine.trim().split(" ");

  //     if (!currentLine || currentLineParts[1] === "Module._compile") {
  //       break;
  //     }

  //     //processTicksAndRejections (unix) | process.processTicksAndRejections
  //     if (
  //       currentLineParts[1] === "processTicksAndRejections" ||
  //       currentLineParts[1] === "process.processTicksAndRejections"
  //     ) {
  //       const lastOccurence = logTitle.indexOf(
  //         delimiter + "*" + currentLineParts[1] + "*" + delimiter
  //       );

  //       logTitle = logTitle.slice(0, lastOccurence);

  //       continue;
  //     }

  //     const currentLinePartsLen = currentLineParts.length;

  //     let calleeFunc = "";

  //     //4 - async | constructor
  //     //3 - normal func
  //     //2 - 1 abv iterable | anonymous (at (location))
  //     if (currentLinePartsLen === 3) {
  //       calleeFunc = currentLineParts[1];

  //       //iterable func or normal func
  //       const [iterableType, iterableFunc] = calleeFunc.split(".");

  //       if (
  //         Logger.NATIVE_ITERATORS_TYPES.includes(iterableType) &&
  //         this._options.ignoreIterators
  //       ) {
  //         continue;
  //       }
  //     } else if (currentLinePartsLen === 4) {
  //       calleeFunc = currentLineParts[1] + " " + currentLineParts[2];
  //     }

  //     //2
  //     else {
  //       continue;
  //     }

  //     logTitle = logTitle.concat(`*${calleeFunc}*`, delimiter);
  //   }

  //   //" ->"
  //   const testEnvDelimiter = delimiter.trimEnd();

  //   //dev (or) prod - delimiter
  //   const checkDelimiter =
  //     process.env.NODE_ENV === "test" ? testEnvDelimiter : delimiter;

  //   if (logTitle.endsWith(checkDelimiter)) {
  //     logTitle = logTitle.slice(0, -checkDelimiter.length);
  //   }

  //   return logTitle;
  // }

  /**
   * Disables all log messages of a particular logger instance/namespace
   * @returns {Logger}
   */
  disableAll(): this {
    const noopLike = () => {
      return Object.freeze({
        stack: "",
        logTitle: "",
        logBody: "",
      });
    };

    this.earlyLog = noopLike;

    const self = Object.defineProperty(this, "log", {
      value: noopLike,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    return self;
  }
}

export { Logger, IEnv, LogReturn, LogOptions };

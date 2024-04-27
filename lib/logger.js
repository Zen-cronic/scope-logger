"use strict";

const { logCallerLineChecker } = require("../utils/logCallerLineChecker");

/**
 * @typedef {Object} LogOptions
 * @property {boolean} ignoreIterators
 * @property {boolean} onlyFirstElem
 */

/**
 * @typedef {Object} LogReturn
 * @property {string | null} stack
 * @property {string | null} logTitle
 * @property {string | null} logBody
 */

class Logger {
  static #colours = [1, 2, 3, 4, 5, 6];
  static #logCallerDelimiter = " -> ";

  static #NATIVE_ITERATORS_TYPES = [
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

  static #defaultOptions = Object.freeze({
    ignoreIterators: false,
    onlyFirstElem: false,
  });

  #colourNum = 7;

  /**
   *
   * @param {string} [namespace]
   * @param {LogOptions} [options]
   * @returns {Logger}
   */

  constructor(namespace, options) {
    if (
      typeof namespace !== "string" &&
      typeof options === "object" &&
      options !== null
    ) {
      options = namespace;
      namespace = null;
    }

    this.args = null;
    this.namespace = namespace;
    this._options = options || Object.assign({}, Logger.#defaultOptions);
    this.firstElem = null;

    if (options) {
      Object.defineProperty(this, "_options", {
        value: this._options,
        enumerable: true,
        configurable: false,
        writable: false,
      });
    }

    //args and _options can change
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
  log(args, options) {
    this.#validateArgs(args);
    this.#setOptions(options);

    this.args = args;
    const err = {};

    //modify to include till Module._compile
    Error.stackTraceLimit = 15;
    Error.captureStackTrace(err);
    // Object.freeze(err);

    let logReturn = this.#handleOnlyFirstElem(err.stack);
    if (logReturn) {
      return logReturn;
    }

    const logTitle = this.#formatLogCall(this.#callStackParser(err.stack));
    const logBody = this.#formatLogContent();

    this.#writeLog(logTitle, logBody);

    logReturn = Object.freeze({
      stack: err.stack,
      logTitle,
      logBody,
    });

    return logReturn;
  }

  /**
   * @param {string} stack
   * @returns {LogReturn | undefined}
   */
  #handleOnlyFirstElem(stack) {
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
  #validateArgs(args) {
    if (
      typeof args !== "object" ||
      args === null ||
      Object.keys(args).length === 0
    ) {
      throw new Error("Must be a non-empty obj");
    }

    if (Object.keys(args).length !== 1) {
      throw new Error("Only 1 property allowed");
    }
  }

  /**
   *
   * @param {LogOptions} [options]
   */
  #setOptions(options) {
    if (options) {
      try {
        this._options = Object.assign(this._options, options);
      } catch (error) {
        throw new Error(
          "Cannot redefine _options if the instance is created with options"
        );
      }
    } else {
      this._options = Object.assign({}, Logger.#defaultOptions);
    }
  }

  /**
   *
   * @param {string} logTitle
   * @param {string} logBody
   */
  #writeLog(logTitle, logBody) {
    process.stdout.write(logTitle + "\n" + logBody + "\n\n");
  }
  /**
   *
   * @param {string} logCall
   * @returns {string}
   */
  #formatLogCall(logCall) {
    const { namespace } = this;

    const delimiter = Logger.#logCallerDelimiter;

    const colour = this.#selectColour();

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

  /**
   *
   * @returns {number}
   */
  #selectColour() {
    const { namespace } = this;

    let numerator;
    let denominator = Logger.#colours.length;

    if (!namespace) {
      numerator = Math.floor(Math.random() * Logger.#colours.length);
    } else {
      let hash = 0;
      const namespaceLen = namespace.length;
      for (let i = 0; i < namespaceLen; i++) {
        hash += namespace.charCodeAt(i);
      }

      numerator = hash;
    }

    return (this.#colourNum = Logger.#colours[numerator % denominator]);
  }

  /**
   * @returns {string}
   */
  #formatLogContent() {
    const { args } = this;

    let logBody = JSON.stringify(
      args,
      (_, val) => {
        if (typeof val === "function") {
          return val.name + " :f()";
        }

        return val;
      },
      2
    );

    logBody = logBody.replace(/(\{)|(\})/g, (match) => {
      return "\x1b[1;3" + this.#colourNum.toString() + "m" + match + "\x1b[0m";
    });

    return logBody;
  }

  /**
   *
   * @param {string} callStack
   * @returns {string}
   */
  #callStackParser(callStack) {
    const callStackParts = callStack.split("\n");
    const callStackPartsLen = callStackParts.length;

    //start loop from the line after log line
    const offset = 1;

    const delimiter = Logger.#logCallerDelimiter;

    let logLineIndex = logCallerLineChecker(callStack) + offset;
    let logTitle = "";

    for (; logLineIndex < callStackPartsLen; logLineIndex++) {
      const currentLine = callStackParts[logLineIndex];

      //at" "x" "y
      let currentLineParts = currentLine.trim().split(" ");

      if (!currentLine || currentLineParts[1] === "Module._compile") {
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
          Logger.#NATIVE_ITERATORS_TYPES.includes(iterableType) &&
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

  disableAll() {
    const noOp = () => {};

    //algorize
    const noOpLogger = {
      log: noOp,
      namespace: this.namespace,
      args: this.args,
      options: { ...this._options },
      firstElem: this.firstElem,
    };

    this.log = noOp;

    return noOpLogger;
  }
}
module.exports = {
  Logger,
};

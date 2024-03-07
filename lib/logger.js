"use strict";

const { logCallerLineChecker } = require("../utils/logCallerLineChecker");

/**
 * @typedef {Object} LogOptions
 * @property {boolean} ignoreIterators
 */

class Logger {
  // \x1b[1;37m //white
  // \x1b[1;30m //black
  // \x1b[0m //reset

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
  });

  #colourNum = 7;

  /**
   *
   * @param {string | undefined} namespace
   * @param {LogOptions | undefined} options
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
    this._options = options ?? Object.assign({}, Logger.#defaultOptions);

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
   * @param {LogOptions | undefined} options
   * @returns {{stack: string;logTitle: string;logBody: string;}}
   */
  log(args, options) {
    if (
      typeof args !== "object" ||
      args === null ||
      Object.keys(args).length === 0
    ) {
      throw new Error("Must be a non-empty obj");
    }

    if (Object.keys(args).length !== 1) {
      throw new Error("Only 1 prop allowed");
    }

    this.args = args;

    if (options) {
      try {
        this._options = Object.assign({}, options);
      } catch (error) {
        //Cannot assign to read only property '_options' of object '#<Logger>'
        throw new Error(
          "Cannot redefine _options if the instance is created with options"
        );
      }
    }

    const logStack = {};
    Error.captureStackTrace(logStack);
    Object.freeze(logStack);

    let logTitle = this.#callStackParser(logStack.stack);
    logTitle = this.#formatLogCall(logTitle);

    const logBody = this.#formatLogContent();

    process.stdout.write(logTitle + "\n" + logBody + "\n\n");

    const logReturn = Object.freeze({
      stack: logStack.stack,
      logTitle,
      logBody,
    });

    return logReturn;
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
      (key, val) => {
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

      //remove last delimiter
      if (!currentLine || currentLineParts[1] === "Module._compile") {
        const lastOccurence = logTitle.lastIndexOf(delimiter);
        logTitle = logTitle.slice(0, lastOccurence);
        break;
      }

      const currentLinePartsLen = currentLineParts.length;

      //3 - normal func
      //2 - iterable func
      if (currentLinePartsLen === 3) {
        const calleeFunc = currentLineParts[1];

        //or normal func
        const [iterableType, iterableFunc] = calleeFunc.split(".");
        if (Logger.#NATIVE_ITERATORS_TYPES.includes(iterableType)) {
          if (this._options.ignoreIterators) {
            continue;
          }
        }

        //handle *process.processTicksAndRejections*
        logTitle = logTitle.concat(
          `*${calleeFunc}*`,
          logLineIndex + 1 === callStackPartsLen ? "" : delimiter
        );
      }
    }

    return logTitle;
  }
}
module.exports = {
  Logger,
};

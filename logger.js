"use strict";

const { logCallerLineChecker } = require("./utils/logCallerLineChecker");

const NATIVE_ITERATORS_TYPES = [
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

// const defaultOptions = {
//   ignoreIterators: false,
// };
const defaultOptions = Object.freeze({
  ignoreIterators: false,
});

/**
 * @typedef {Object} LogOptions
 * @property {boolean} ignoreIterators
 */

class Logger {
  /**
   *
   * @param {string} namespace
   * @param {LogOptions | undefined} options
   * @returns {Logger}
   */

  constructor(namespace, options) {
    this.args = null;
    this.namespace = namespace ?? null;
    this._options = options ?? Object.assign({}, defaultOptions);

    if (options) {
      //can still reassign
      // Object.freeze(this._options);

      Object.defineProperty(this, "_options", {
        value: this._options,
        // enumerable: true,
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
   * @returns {string}
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
    // Object.freeze(options)

    // this._options = options;

    //true if options is NOT provided and NOT copied
    // console.log("is this._options frozen?: ", Object.isFrozen(this._options));

    if (options) {
      try {
        this._options = Object.assign({}, options);

        // If the instance was created with options (making _options non-writable), this will throw an error.
      } catch (error) {
        // console.log(error.message);
        //Cannot assign to read only property '_options' of object '#<Logger>'
        throw new Error(
          "Cannot redefine _options if the instance is created with options"
        );
      }
    }

    const logStack = {};

    Error.captureStackTrace(logStack);

    Object.freeze(logStack);

    // Object.defineProperty(logStack, "stack", {
    //   value: logStack.stack,
    //   enumerable: true,
    //   writable: false,
    // });

    //test
    // console.log(logStack.stack);

    const namespace = this.namespace;
    const logTitle = namespace
      ? `${namespace}: ${this.#callStackParser(logStack.stack)}`
      : this.#callStackParser(logStack.stack);

    console.log(logTitle);
    console.log(JSON.stringify(args, null, 2));

    // return this;

    // logStack.stack = 1;
    return logStack.stack;
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

    // let logLineIndex = 2;
    let logLineIndex = logCallerLineChecker(callStack) + offset;
    let logTitle = "";

    for (; logLineIndex < callStackPartsLen; logLineIndex++) {
      const currentLine = callStackParts[logLineIndex];
      if (!currentLine) {
        break;
      }

      //at" "x" "y
      let currentLineParts = currentLine.trim().split(" ");

      if (currentLineParts[1] === "Module._compile") {
        break;
      }

      const currentLinePartsLen = currentLineParts.length;

      //3 - normal func
      //2 - iterable func
      if (currentLinePartsLen === 3) {
        const calleeFunc = currentLineParts[1];

        //or normal func
        const [iterableType, iterableFunc] = calleeFunc.split(".");
        if (NATIVE_ITERATORS_TYPES.includes(iterableType)) {
          if (this._options.ignoreIterators) {
            console.log("From continue: ", this._options.ignoreIterators);
            continue;
          }

          //test
          console.log("Iterable Type and Func: ", iterableType, iterableFunc);
        }
        logTitle = logTitle.concat(`From _${calleeFunc} -> `);
      }
    }

    return logTitle;
  }
}
module.exports = {
  Logger,
};

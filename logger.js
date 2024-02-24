"use strict";

const { logCallerLineChecker } = require("./utils/logCallerLineChecker");

const NATIVE_ITERATORS_TYPES = [
  "Array",
  "Map",
  "Set",

  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
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

class Logger {
  /**
   *
   * @param {string} namespace
   * @returns {Logger}
   */
  constructor(namespace) {
    this.args = null;
    //shallow copy
    this._options = Object.assign({}, defaultOptions);

    this.namespace = namespace ?? null;

    //args and _options can change
    Object.defineProperty(this, "namespace", {

      value: this.namespace,
      enumerable: true,
      configurable: false,
      writable: false
    })

    //Object.definePropterty to prevent writing args & namespace
    // Object.defineProperties(this, {
    //   args: {
    //     value: this.args,
    //     enumerable: true,
    //     configurable: false,
    //     writable: false,
    //   }
    // })

    // Object.freeze(this.args)


    //return namespace fx - try w/ functional
    //

    // console.log(this.#_namespace);

    // this.#_namespace.namespace =
    // return this.#_namespace.bind(this);

    // this.#_namespace.bind(this);
    // return this
  }

  /**
   *
   * @param {{}} args
   * @param {{ignoreIterators: Boolean}} options
   * @returns {string}
   */
  log(args, options = defaultOptions) {
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
    this._options = Object.assign({}, options);
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

    const namespace = this.namespace
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
            // console.log("From continue: ", this._options.ignoreIterators);
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

  /**
   *
   * @param {string} name
   * @returns
   */
  // #_namespace(name) {
  //   //append the provided name to front of log()
  //   //e.g., Server: From ... ...

  //   // if (!name) {
  //   //   return;
  //   // }

  //   if (typeof name !== "string") {
  //     throw new TypeError("name param must be string");
  //   }

  //   this.name = name;

  //   console.log("this from #_namespace: ", this);
  //   // Object.setPrototypeOf(this, Object.getPrototypeOf(new Logger()))

  //   // console.log(Object.getPrototypeOf(this));
  //   console.log(
  //     Object.getPrototypeOf(this) === Object.getPrototypeOf(new Logger())
  //   );
  //   return this;
  // }
}
module.exports = {
  Logger,
};

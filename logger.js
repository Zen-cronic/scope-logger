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
  constructor() {
    this.args = null;
    //shallow copy
    this._options = Object.assign({}, defaultOptions);

    //Object.definePropterty to prevent writing args
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
    // console.log("is this._options fr/ozen?: ", Object.isFrozen(this._options));
    this._options = Object.assign({}, options);
    const logStack = {};

    Error.captureStackTrace(logStack);

    Object.defineProperty(logStack, "stack", {
      value: logStack.stack,
      enumerable: true,
    });

    //test
    console.log(logStack.stack);

    const logTitle = this.#callStackParser(logStack.stack);
    console.log(logTitle);
    console.log(JSON.stringify(args, null, 2));

    // console.log("defaultOptions after each log: ", defaultOptions);
    // return this;

    console.log("explicit logStack.stack from logger.log return: ", logStack.stack);
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

    let logLineIndex = 2;
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

  // diff() {
  //   if (Object.keys(this.args).length !== 2) {
  //     throw new Error("2 objects needed");
  //     //chee buu e sarr the
  //   }
  //   const a = Object.values(this.args)[0];
  //   const b = Object.values(this.args)[1];
  //   // const a = Object.values(args)[0];
  //   // const b = Object.values(args)[1];

  //   for (const keyA in a) {
  //     if (b[keyA]) {
  //       console.log(`${keyA} in both a and b`);
  //     } else {
  //       console.log(`${keyA} only in a`);
  //     }
  //   }

  //   for (const keyB in b) {
  //     if (!a[keyB]) {
  //       console.log(`${keyB} only in b`);
  //     }
  //   }
  // }
}
module.exports = {
  Logger,
};

const { option } = require("yargs");
const { callStackParser } = require("./callStackParser");

function log(args) {
  if (Object.keys(args).length === 2) {
    return {
      diff: function () {
        const a = Object.values(args)[0];
        const b = Object.values(args)[1];

        for (const keyA in a) {
          if (b[keyA]) {
            console.log(`${keyA} in both a and b`);
          } else {
            console.log(`${keyA} only in a`);
          }
        }

        for (const keyB in b) {
          if (!a[keyB]) {
            console.log(`${keyB} only in b`);
          }
        }
      },
    };
  }
  if (
    typeof args !== "object" ||
    args === null ||
    Object.keys(args).length === 0
  ) {
    throw new Error();
  }
  const stack = new Error().stack;
  // console.log(stack);
  // const callee = stack.split("\n")
  const calleeStack = stack.split("\n")[2].trim();
  console.log(`callee Stack: ${calleeStack} `);

  const callee = calleeStack.split(/at /)[1].split(/\s/)[0];
  // console.log(`Callee: ${callee}`);
  console.log(`From ${callee}:`);
  console.log(JSON.stringify(args, null, 2));
  //   console.log(arg);
}
function logDiff(a, b) {
  //assumes both are object Object

  for (const keyA in a) {
    if (b[keyA]) {
      console.log(`${keyA} in both a and b`);
    } else {
      console.log(`${keyA} only in a`);
    }
  }

  for (const keyB in b) {
    if (!a[keyB]) {
      console.log(`${keyB} only in b`);
    }
  }
}

const NATIVE_ITERATORS_TYPE = [
  "Array",
  "Map",
  "Set",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int8Array",
];

class Logger {
  constructor() {
    this.args = null;
    this.options = { ignoreIterators: false };
  }

  /**
   *
   * @param {{}} args
   * @param {{ignoreIterators: Boolean}} options
   * @returns
   */
  log(args, options) {
    if (
      typeof args !== "object" ||
      args === null ||
      Object.keys(args).length === 0
    ) {
      throw new Error("Must be a non-empty obj");
    }

    this.args = args;
    // Object.freeze(options)
    if (options) {
      // {ignoreArrayMethods: true}
      console.log(options);
      this.options = options;
    }
    if (Object.keys(args).length === 1) {
      const logStack = {};
      Error.captureStackTrace(logStack);

      // const stack = new Error().stack;
      // console.log(logStack.stack);

      // const callee = stack.split("\n")
      // const calleeStack = stack.split("\n")[2].trim();

      // const callee = calleeStack.split(/at /)[1].split(/\s/)[0];
      // console.log(`Callee: ${callee}`);

      //native fx call
      // const nativeFunctionCalleeStack = stack.split("\n")[3].trim();
      // const nativeFunctionCallee = nativeFunctionCalleeStack
      //   .split(/at /)[1]
      //   .split(/\s/)[0];
      // let logTitle = `From __${callee}__`

      // if (callee === "Object.<anonymous>") {
      //   console.log("Possibly from global");
      // }

      // const [nativeDataType, nativeFunction] = nativeFunctionCallee.split(".");
      // switch (nativeDataType) {
      //   case "Array":
      //     let logTitle = "";
      //     if (callee === "Object.<anonymous>") {
      //       // console.log("Possibly from global or Native functions");

      //       logTitle
      //         `From ${nativeDataType}.${nativeFunction} From _: `

      //     } else {
      //       logTitle =
      //         `From ${nativeDataType}.${nativeFunction} From ${callee}: `

      //     }

      //     console.log(logTitle);
      //     console.log(JSON.stringify(args, null, 2));

      //     break;
      //   //not from a loop therefore, jsut a funnction
      //   default:
      //     // console.log(`callee Stack: ${calleeStack} `);

      //     console.log(`From ${callee}:`);
      //     console.log(JSON.stringify(args, null, 2));
      //     //   console.log(arg);
      //     break;
      // }

      // console.log(`callee Stack: ${calleeStack} `);

      // const callee = calleeStack.split(/at /)[1].split(/\s/)[0];
      // // console.log(`Callee: ${callee}`);

      // if(callee === "Object.<anonymous>"){
      //   console.log("Possibly from global or Native functions");
      // }

      // console.log(`From ${callee}:`);
      // console.log(JSON.stringify(args, null, 2));
      // //   console.log(arg);

      // else{
      //   const logTitle = callStackParser(stack)
      //   console.log(logTitle);
      // }

      // console.log(logTitle);
      // const logTitle = callStackParser(stack);
      // const logTitle = callStackParser(logStack.stack);
      const logTitle = this.#callStackParser(logStack.stack);
      console.log(logTitle);
      console.log(JSON.stringify(args, null, 2));
    }

    return this;
  }

  diff() {
    if (Object.keys(this.args).length !== 2) {
      throw new Error("2 objects needed");
      //chee buu e sarr the
    }
    const a = Object.values(this.args)[0];
    const b = Object.values(this.args)[1];
    // const a = Object.values(args)[0];
    // const b = Object.values(args)[1];

    for (const keyA in a) {
      if (b[keyA]) {
        console.log(`${keyA} in both a and b`);
      } else {
        console.log(`${keyA} only in a`);
      }
    }

    for (const keyB in b) {
      if (!a[keyB]) {
        console.log(`${keyB} only in b`);
      }
    }
  }

  /**
   *
   * @param {string} callStack
   * @returns {string}
   */

  #callStackParser(callStack) {
    const callStackParts = callStack.split("\n");
    const callStackPartsLen = callStackParts.length;

    let splitIndex = 2;
    let logTitle = "";

    for (; splitIndex < callStackPartsLen; splitIndex++) {
      if (!callStackParts[splitIndex]) {
        break;
      }
      let currentLineParts = callStackParts[splitIndex].trim().split(" ");

      if (currentLineParts[1] === "Module._compile") {
        break;
      }

      const currentLinePartsLen = currentLineParts.length;

      if (currentLinePartsLen === 3) {
        const calleeFunc = currentLineParts[1];

        // console.log(this.options.ignoreArrayMethods);
        // if (calleeFunc.includes("Array.")
        if (NATIVE_ITERATORS_TYPE.includes(calleeFunc.split(".").shift())) {
          if (this.options.ignoreIterators) {
            console.log("From continue: ", this.options.ignoreIterators);
            continue;
          }
          // const arrFx = calleeFunc.split(".").pop();

          // logTitle = logTitle.concat(`From _Array.${arrFx}_ -> `);
          //   logTitle = logTitle.concat(`From _${calleeFunc}_ -> `);
          // } else {
          //   logTitle = logTitle.concat(`From _${calleeFunc}_ -> `);
        }
        logTitle = logTitle.concat(`From _${calleeFunc}_ -> `);
      }
    }

    return logTitle;
  }
}
module.exports = {
  log,
  logDiff,
  Logger,
};

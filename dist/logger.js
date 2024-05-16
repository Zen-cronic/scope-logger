"use strict";
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a getter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it"
      );
    return kind === "m"
      ? f
      : kind === "a"
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _Logger_instances,
  _a,
  _Logger_defaultOptions,
  _Logger_handleOnlyFirstElem,
  _Logger_validateArgs,
  _Logger_setOptions,
  _Logger_writeLog,
  _Logger_formatLogCall,
  _Logger_selectColour,
  _Logger_formatLogContent,
  _Logger_callStackParser;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const logCallerLineChecker_1 = __importDefault(
  require("./utils/logCallerLineChecker")
);
class Logger {
  /**
   *
   * @param {string} namespace
   * @param {LogOptions} [options]
   */
  constructor(namespace, options) {
    _Logger_instances.add(this);
    this.args = null;
    this.namespace = namespace;
    this._options =
      options ||
      Object.assign(
        {},
        __classPrivateFieldGet(_a, _a, "f", _Logger_defaultOptions)
      );
    this.firstElem = null;
    _a.colourNum = __classPrivateFieldGet(
      this,
      _Logger_instances,
      "m",
      _Logger_selectColour
    ).call(this);
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
  earlyLog(errorStack, args, options) {
    __classPrivateFieldGet(
      this,
      _Logger_instances,
      "m",
      _Logger_validateArgs
    ).call(this, args);
    __classPrivateFieldGet(
      this,
      _Logger_instances,
      "m",
      _Logger_setOptions
    ).call(this, options);
    this.args = args;
    // let logReturn = this.#handleOnlyFirstElem(err.stack);
    let logReturn = __classPrivateFieldGet(
      this,
      _Logger_instances,
      "m",
      _Logger_handleOnlyFirstElem
    ).call(this, errorStack);
    // if (logReturn) {
    return logReturn;
    // }
    // const logTitle = this.#formatLogCall(this.#callStackParser(err.stack));
    // const logBody = this.#formatLogContent();
    // this.#writeLog(logTitle, logBody);
    // logReturn = Object.freeze({
    //   stack: err.stack,
    //   logTitle,
    //   logBody,
    // });
    // return logReturn;
  }
  /**
   * Disables all log messages of a particular logger instance/namespace
   * @returns {Logger}
   */
  disableAll() {
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
exports.Logger = Logger;
(_a = Logger),
  (_Logger_instances = new WeakSet()),
  (_Logger_handleOnlyFirstElem = function _Logger_handleOnlyFirstElem(stack) {
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
  }),
  (_Logger_validateArgs = function _Logger_validateArgs(args) {
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
  }),
  (_Logger_setOptions = function _Logger_setOptions(options) {
    if (options) {
      try {
        this._options = Object.assign(this._options, options);
      } catch (error) {
        throw new Error(
          "Cannot redefine _options if the instance is created with options"
        );
      }
    } else {
      this._options = Object.assign(
        {},
        __classPrivateFieldGet(_a, _a, "f", _Logger_defaultOptions)
      );
    }
  }),
  (_Logger_writeLog = function _Logger_writeLog(logTitle, logBody) {
    process.stdout.write(logTitle + "\n" + logBody + "\n\n");
  }),
  (_Logger_formatLogCall = function _Logger_formatLogCall(logCall) {
    const { namespace } = this;
    const delimiter = _a.logCallerDelimiter;
    const colour = __classPrivateFieldGet(
      this,
      _Logger_instances,
      "m",
      _Logger_selectColour
    ).call(this);
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
  }),
  (_Logger_selectColour = function _Logger_selectColour() {
    const { namespace } = this;
    let numerator;
    let denominator = _a.colours.length;
    if (!namespace) {
      numerator = Math.floor(Math.random() * _a.colours.length);
    } else {
      let hash = 0;
      const namespaceLen = namespace.length;
      for (let i = 0; i < namespaceLen; i++) {
        hash += namespace.charCodeAt(i);
      }
      numerator = hash;
    }
    return _a.colours[numerator % denominator];
  }),
  (_Logger_formatLogContent = function _Logger_formatLogContent() {
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
      return "\x1b[1;3" + _a.colourNum.toString() + "m" + match + "\x1b[0m";
    });
    return logBody;
  }),
  (_Logger_callStackParser = function _Logger_callStackParser(callStack) {
    const callStackParts = callStack.split("\n");
    const callStackPartsLen = callStackParts.length;
    //start loop from the line after log line
    const offset = 1;
    const delimiter = _a.logCallerDelimiter;
    let logLineIndex = (0, logCallerLineChecker_1.default)(callStack) + offset;
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
          _a.NATIVE_ITERATORS_TYPES.includes(iterableType) &&
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
  });
Logger.colours = [1, 2, 3, 4, 5, 6];
Logger.logCallerDelimiter = " -> ";
Logger.NATIVE_ITERATORS_TYPES = [
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
_Logger_defaultOptions = {
  value: Object.freeze({
    ignoreIterators: false,
    onlyFirstElem: false,
  }),
};
Logger.colourNum = 7;

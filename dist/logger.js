"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Logger_instances, _a, _Logger_handleOnlyFirstElem, _Logger_validateArgs, _Logger_setOptions, _Logger_selectColour;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const entryPoint_1 = require("./utils/entryPoint");
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
        this.firstElem = null;
        _a.colourNum = __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_selectColour).call(this);
        this._options =
            options !== undefined
                ? Object.assign({}, _a.defaultOptions, options)
                : Object.assign({}, _a.defaultOptions);
        if (options) {
            Object.defineProperty(this, "_options", {
                value: this._options,
                enumerable: true,
                configurable: false,
                writable: false,
            });
        }
        //args can change
        //_options may change unless set in constructor
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
    _earlyLog(errorStack, args, options) {
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_validateArgs).call(this, args);
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_setOptions).call(this, options);
        this.args = args;
        const logReturn = __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_handleOnlyFirstElem).call(this, errorStack);
        return logReturn;
    }
    _formatLogBody() {
        const { args } = this;
        let logBody = JSON.stringify(args, (_, val) => {
            let printedVal = "";
            switch (typeof val) {
                case "function":
                    if (!val.name) {
                        printedVal = "anonymous()";
                    }
                    else {
                        printedVal = `${val.name}()`;
                    }
                    break;
                case "undefined": {
                    printedVal = "undefined";
                    break;
                }
                default:
                    break;
            }
            return printedVal || val;
        }, 2);
        logBody = logBody.replace(/(\{)|(\})/g, (match) => {
            return "\x1b[1;3" + _a.colourNum.toString() + "m" + match + "\x1b[0m";
        });
        return logBody;
    }
    /**
     * Disables all log messages of a particular logger instance/namespace
     */
    disableAll() {
        const noopLike = () => {
            return Object.freeze({
                stack: null,
                logTitle: null,
                logBody: null,
            });
        };
        this._earlyLog = noopLike;
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
_a = Logger, _Logger_instances = new WeakSet(), _Logger_handleOnlyFirstElem = function _Logger_handleOnlyFirstElem(stack) {
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
}, _Logger_validateArgs = function _Logger_validateArgs(args) {
    if (typeof args !== "object" ||
        args === null ||
        Object.keys(args).length === 0) {
        throw new TypeError("Must be a non-empty obj");
    }
    if (Object.keys(args).length !== 1) {
        throw new Error("Only 1 property allowed");
    }
}, _Logger_setOptions = function _Logger_setOptions(options) {
    if (options) {
        try {
            this._options = Object.assign({}, //or this._options //existing
            _a.defaultOptions, //default
            options //passed
            );
        }
        catch (error) {
            const errorRe = /^Cannot assign to read only property .*/;
            if (error.name === "TypeError" && errorRe.test(error.message)) {
                throw new Error("Cannot redefine _options in the instance if the constructor is called with options." +
                    "\n" +
                    "Already called with: " +
                    JSON.stringify(this._options));
            }
            else {
                throw error;
            }
        }
    }
    else {
        const propDesc = Object.getOwnPropertyDescriptor(this, "_options");
        //check whether already set by constructor
        if (propDesc?.configurable && propDesc?.writable) {
            this._options = Object.assign({}, _a.defaultOptions);
        }
    }
}, _Logger_selectColour = function _Logger_selectColour() {
    const { namespace } = this;
    let numerator;
    let denominator = _a.colours.length;
    if (!namespace) {
        numerator = Math.floor(Math.random() * _a.colours.length);
    }
    else {
        let hash = 0;
        const namespaceLen = namespace.length;
        for (let i = 0; i < namespaceLen; i++) {
            hash += namespace.charCodeAt(i);
        }
        numerator = hash;
    }
    return _a.colours[numerator % denominator];
};
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
Logger.defaultOptions = Object.freeze({
    ignoreIterators: false,
    onlyFirstElem: false,
    entryPoint: (0, entryPoint_1.getDefaultEntryPoint)(),
});
Logger.colourNum = 7;

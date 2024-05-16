"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineFileExt = exports.setupTest = void 0;
//repeated setup + beforeEach
const path_1 = require("path");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
/**
 * Sets up the test environment for each suite.
 * @param {...string} processFilePath - The path(s) to the test process file(s).
 */
function setupTest(...processFilePath) {
    let testProcessPath = (0, path_1.join)(__dirname, "..", "__tests__", ...processFilePath);
    testProcessPath = configureFileType(testProcessPath);
    if (!(0, fs_1.existsSync)(testProcessPath)) {
        throw new Error(`Specified test process path DOES NOT EXIST: ${testProcessPath}`);
    }
    let workerProcess;
    let testCaseNum = 0;
    /**
     * Creates worker process
     * @param {string} testProcessPath
     */
    function createProcess(testProcessPath) {
        if (typeof testProcessPath !== "string" || !(0, fs_1.existsSync)(testProcessPath)) {
            throw new Error("Test Process Path Does Not Exist");
        }
        workerProcess = (0, child_process_1.fork)(testProcessPath, {
            stdio: [0, "pipe", "pipe", "ipc"],
            // execArgv: ["-r", "ts-node/register"],
            env: Object.assign({}, process.env, { NODE_ENV: "test" }),
        });
        testCaseNum++;
        workerProcess.send(testCaseNum);
        workerProcess.stdout.pipe(process.stderr, {
            end: false,
        });
    }
    /**
     * Creates data by worker
     * @returns {Promise<string>}
     * @throws {Error}
     */
    function createWorkerDataPromise() {
        return new Promise((resolve, reject) => {
            let data = "";
            workerProcess.stderr.on("data", (chunk) => {
                data += chunk;
            });
            workerProcess.stderr.once("end", () => {
                resolve(data);
            });
            workerProcess.stderr.once("error", reject);
        });
    }
    /**
     * Retrieves message sent by worker
     * @returns {Promise<{length: number} | {error: string}>}
     * @throws {Error} When the worker process exits with a non-zero code, or if no message is received from the worker process within the timeout period.
     */
    function createMessagePromise() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout waiting for message from worker process"));
                // }, 1000);
                // }, 2000); NOT enuf for 5 layers arr: onlyFirstElemOption proc
            }, 4000);
            workerProcess.once("error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
            workerProcess.once("message", (message) => {
                clearTimeout(timeout);
                if ("error" in message) {
                    reject(new Error(message.error));
                }
                resolve(message);
            });
            workerProcess.once("exit", (code, signal) => {
                clearTimeout(timeout);
                if (code === 0) {
                    //worker default length:0
                    resolve({ length: 0 });
                }
                reject(new Error(`Worker process exited with code ${code} & signal ${signal}`));
            });
        });
    }
    beforeEach(() => {
        createProcess(testProcessPath);
    });
    return { createMessagePromise, createWorkerDataPromise };
}
exports.setupTest = setupTest;
/**
 * Determine in which env the code is run (.js or .ts)
 */
function determineFileExt(filePath) {
    const ext = (0, path_1.extname)(filePath).replace(/^\./, "");
    if (ext !== "js" && ext !== "ts") {
        throw new Error(`Invalid file extension: ${ext}`);
    }
    return ext;
}
exports.determineFileExt = determineFileExt;
/**
 * Configure file type based on the current env so that user can send either .ts or .js
 */
function configureFileType(filePath) {
    const thisExt = determineFileExt(__filename);
    const testExt = determineFileExt(filePath);
    //by default use this.extension
    if (testExt !== thisExt) {
        filePath = filePath.replace(new RegExp(testExt + "$"), thisExt);
    }
    return filePath;
}

//repeated setup + beforeEach
import { extname, join } from "path";
import { ChildProcess, Serializable, fork } from "child_process";
import { existsSync } from "fs";
import {
  FileExt,
  WorkerErrorMessage,
  WorkerMessage,
  WorkerNonErrorMessage,
} from "../types";

let workerProcess: ChildProcess | null = null;
let ttlCleanups = 0
/**
 * Sets up the test environment for each suite.
 * @param {...string} processFilePath - The path(s) to the test process file(s).
 */
export function setupTest(...processFilePath: string[]) {
  let testProcessPath = join(__dirname, "..", "__tests__", ...processFilePath);

  testProcessPath = configureFileType(testProcessPath);

  if (!existsSync(testProcessPath)) {
    throw new Error(
      `Specified test process path DOES NOT EXIST: ${testProcessPath}`
    );
  }

  // let workerProcess: ChildProcess;
  let testCaseNum: number = 0;

  /**
   * Creates worker process
   * @param {string} testProcessPath
   */
  function createProcess(testProcessPath: string): void {
    workerProcess = fork(testProcessPath, {
      stdio: [0, "pipe", "pipe", "ipc"],
      // execArgv: ["-r", "ts-node/register"],

      // ? necessary
      env: Object.assign({}, process.env, { NODE_ENV: "test" }),
    });

    testCaseNum++;

    workerProcess.send(testCaseNum);

    (workerProcess.stdout as NodeJS.WriteStream).pipe(process.stderr, {
      end: false,
    });
  }

  /**
   * Creates data by worker
   * @returns {Promise<string>}
   * @throws {Error}
   */
  function createWorkerDataPromise(): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = "";

      (workerProcess?.stderr as NodeJS.WriteStream).on("data", (chunk) => {
        data += chunk;
      });

      (workerProcess?.stderr as NodeJS.WriteStream).once("end", () => {
        resolve(data);
      });

      (workerProcess?.stderr as NodeJS.WriteStream).once("error", reject);
    });
  }

  /**
   * Retrieves message sent by worker
   * @returns {Promise<{length: number} | {error: string}>}
   * @throws {Error} When the worker process exits with a non-zero code, or if no message is received from the worker process within the timeout period.
   */
  function createMessagePromise(): Promise<WorkerNonErrorMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for message from worker process"));
        // }, 3000); NOT enuf for 5 layers arr: onlyFirstElemOption proc
      }, 4500);

      workerProcess?.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      workerProcess?.once("message", (message: Serializable) => {
        clearTimeout(timeout);

        if ("error" in (message as WorkerMessage)) {
          reject(new Error((message as WorkerErrorMessage).error));
        }
        resolve(message as WorkerNonErrorMessage);
      });

      workerProcess?.once("exit", (code, signal) => {
        clearTimeout(timeout);

        if (code === 0) {
          //worker default length:0
          resolve({ length: 0 });
        }

        reject(
          new Error(
            `Worker process exited with code ${code} & signal ${signal}`
          )
        );
      });
    });
  }

  beforeEach(() => {
    createProcess(testProcessPath);
  });

  afterEach(() => {
    if (workerProcess) {
      cleanup(workerProcess);
      ttlCleanups++
      workerProcess = null; //this makes ChildProcess | null
    }
  });

  afterAll(() => {
    console.log(`Ttl cleanup count: ${ttlCleanups}`);
    
  })
  return { createMessagePromise, createWorkerDataPromise };
}

function cleanup(testProcess: ChildProcess): void {
  testProcess.kill(0); //must be ?. ?
  testProcess.stdin?.end();
  testProcess.stdin?.destroy();
  testProcess.stdout?.destroy();
  testProcess.stderr?.destroy();

  // console.log(`Cleanup successful`);
  
}
/**
 * Determine in which env the code is run (.js or .ts)
 */
export function determineFileExt(filePath: string): FileExt {
  const ext = extname(filePath).replace(/^\./, "");

  if (ext !== "js" && ext !== "ts") {
    throw new Error(`Invalid file extension: ${ext}`);
  }

  return ext as FileExt;
}

/**
 * Configure file type based on the current env so that user can send either .ts or .js
 */
function configureFileType(filePath: string): string {
  const thisExt = determineFileExt(__filename);

  const testExt = determineFileExt(filePath);

  //by default use this.extension
  if (testExt !== thisExt) {
    filePath = filePath.replace(new RegExp(testExt + "$"), thisExt);
  }

  return filePath;
}

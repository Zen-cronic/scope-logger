const { join } = require("path");
const { exec, execFile } = require("child_process");

describe("callStackParser function", () => {
  describe("given a nested function with array function call", () => {
    it("should log the call stack function names in order", (done) => {
      const testProcessPath = join(
        __dirname,
        ".",
        "callStackParser.test.process.js"
      );

      //stderr for child process testing
      //stdout for logging
      exec(`node ${testProcessPath}`, (err, stdout, stderr) => {
        if (err) {
          // console.log("ERROR found!");
          console.error(err);
          return;
        }

        // const logTitle = stdout
        // console.log("stdout: ", stdout);
        const logTitle = stderr;
        const expected =
          "Log tester: _Array.forEach -> _testOuterFn -> _Object.<anonymous>\n".repeat(
            3
          );

        try {
          expect(logTitle).toBe(expected);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

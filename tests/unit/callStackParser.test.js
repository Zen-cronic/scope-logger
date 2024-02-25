const { Logger } = require("../../logger");
const { join } = require("path");
const { exec } = require("child_process");

describe("callStackParser function", () => {
  describe("given a nested function with array function call", () => {
    it("should log the call stack function names in order", (done) => {
      const testProcessPath = join(
        __dirname,
        ".",
        "callStackParser.test.process.js"
      );

      exec(`node ${testProcessPath}`, (err, stdout, stderr) => {
        if (err) {
          // console.log("ERROR found!");
          console.error(err);
          return;
        }

        const logTitle = stdout
        const expected =
          "Log tester: _Array.forEach -> _testOuterFn -> _Object.<anonymous> -> \n".repeat(
            3
          );
        expect(logTitle).toBe(expected);
        done()
      });
      // done();
    });
  });
});

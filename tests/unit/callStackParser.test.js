const { callStackParser } = require("../../callStackParser");

describe("callStackParser function", () => {
  describe("given a nested function with array function call", () => {
    it("should log the call stack function names in order", () => {
        
      const exampleCallStack = `Error
     at Logger.log (C:\Users\kaungzinhein\jsCode\lib-proj\obj-logger\logger.js:81:13)
    at C:\Users\kaungzinhein\jsCode\lib-proj\obj-logger\index.js:68:14
    at Array.find (<anonymous>)
    at C:\Users\kaungzinhein\jsCode\lib-proj\obj-logger\index.js:66:12
    at Array.some (<anonymous>)
    at nestedArr (C:\Users\kaungzinhein\jsCode\lib-proj\obj-logger\index.js:65:12)
    at Object.<anonymous> (C:\Users\kaungzinhein\jsCode\lib-proj\obj-logger\index.js:74:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)`;

      const result = callStackParser(exampleCallStack);

      expect(result).toBe(
        "From _Array.find_ -> From _Array.some_ -> From _nestedArr_ -> From _Object.<anonymous>_ -> "
      );
      expect(true).toBe(true);
    });
  });
});

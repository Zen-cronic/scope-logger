import { NodeLogger } from "../../index";

describe("immutability and configurability of option arguments", () => {
  const testArr: number[] = [1, 2, 3, 4, 5];
  const defaultOptions = NodeLogger.defaultOptions;

  describe("given that a NodeLogger instance is created with options", () => {
    it("should NOT allow options to be set by the log func", () => {
      const logger = new NodeLogger("Test", {
        ignoreIterators: true,
        onlyFirstElem: true,
      });

      const calledWith = JSON.stringify(logger._options);
      
      // const escapedCalledWith = calledWith.replace(/\"/g, '\\"');
      const expectedErrorMsg = new RegExp(
        `Cannot redefine _options in the instance if the constructor is called with options.\nAlready called with: ${calledWith}`
      );
      expect(() => {
        testArr.forEach((num) => {
          logger.log({ num }, { ignoreIterators: false });
        });
      }).toThrow(expectedErrorMsg);
    });

    it("logger instances should retain the original option values", () => {
      const logger = new NodeLogger("Test", {
        ignoreIterators: true,
        onlyFirstElem: true,
      });

      expect(() => {
        testArr.forEach((num) => {
          logger.log({ num });
        });
      }).not.toThrow();

      expect(logger._options).toStrictEqual({
        ...defaultOptions,
        ignoreIterators: true,
        onlyFirstElem: true,
      });
    });
  });

  describe("given that a NodeLogger instance is NOT created with options", () => {
    it("should allow options to be set by the log func", () => {
      const logger = new NodeLogger("Test");
      expect(() => {
        testArr.map((num) => {
          logger.log({ num }, { ignoreIterators: true, onlyFirstElem: true });
        });
      }).not.toThrow();

      expect(logger._options).toStrictEqual({
        ...defaultOptions, 
        ignoreIterators: true,
        onlyFirstElem: true,
      });
    });

    it("should allow reconfiguration of the options by the same instance", () => {
      const logger = new NodeLogger("Test");

      expect(() => {
        testArr.map((num) => {
          logger.log({ num }, { ignoreIterators: true });
          logger.log({ num }, { ignoreIterators: false, onlyFirstElem: true });
        });
      }).not.toThrow();

      expect(logger._options).toStrictEqual({
        ...defaultOptions,
        ignoreIterators: false,
        onlyFirstElem: true,
      });
    });

    it("missing options provided to the instance must use default values", () => {
      const logger = new NodeLogger("Test");

      expect(logger._options).toStrictEqual(defaultOptions);

      //missing one option
      testArr.map((num) => {
        logger.log({ num }, { ignoreIterators: true });
      });

      expect(logger._options).toStrictEqual({
        ...defaultOptions,
        ignoreIterators: true,
      });

      //all options provided
      testArr.map((num) => {
        logger.log({ num }, { ignoreIterators: false, onlyFirstElem: true });
      });

      expect(logger._options).toStrictEqual({
        ...defaultOptions,
        ignoreIterators: false,
        onlyFirstElem: true,
      });

      //turn back missing to default
      testArr.map((num) => {
        logger.log({ num }, { ignoreIterators: true });
      });

      expect(logger._options).toStrictEqual({
        ...defaultOptions,
        ignoreIterators: true,
        onlyFirstElem: false,
      });

      //turn back all to default
      testArr.map((num) => {
        logger.log({ num });
      });

      expect(logger._options).toStrictEqual(defaultOptions);
    });
  });
});

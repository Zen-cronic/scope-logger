import { NodeLogger } from "../../index";

describe("immutability of options variable", () => {
  const testArr: number[] = [1, 2, 3, 4, 5];

  describe("given that a NodeLogger instance is created with options", () => {
    it("should NOT allow options to be set by the log func", () => {
      const logger = new NodeLogger("Test", {
        ignoreIterators: true,
        onlyFirstElem: true,
      });

      expect(() => {
        testArr.forEach((num) => {
          logger.log({ num }, { ignoreIterators: false });
        });
      }).toThrow(
        /^Cannot redefine _options if the instance is created with options$/
      );
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
    });
  });

  describe("given that a NodeLogger instance has already set options", () => {
    it("should allow reconfiguring of the options by the same instance", () => {
      const logger = new NodeLogger("Test");
      expect(() => {
        testArr.map((num) => {
          logger.log({ num }, { ignoreIterators: true });
          logger.log({ num }, { ignoreIterators: false, onlyFirstElem: true });
        });
      }).not.toThrow();
    });
  });
});

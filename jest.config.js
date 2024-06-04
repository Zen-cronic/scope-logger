"use strict";
/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.+(spec|test).+(ts|tsx)"],

  transform: {
    // "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(ts|tsx)$": ["ts-jest", {isolatedModules: true}],
  },
};

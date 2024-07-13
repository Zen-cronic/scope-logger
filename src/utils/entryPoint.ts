import { type DefaultEntryPoint } from "../types";

export function isESModule(): boolean {
  let isESM = false;
  try {
    require("assert");
  } catch (error) {
    isESM = true;
    throw error;
  }
  return isESM;
}

const entryPointMap: { ESM: DefaultEntryPoint; CJS: DefaultEntryPoint } = {
  ESM: "ModuleJob.run",
  CJS: "Module._compile",
};

export function getDefaultEntryPoint(): DefaultEntryPoint {
  const isESM = isESModule();

  return isESM ? entryPointMap.ESM : entryPointMap.CJS;
}

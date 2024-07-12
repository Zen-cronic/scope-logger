"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultEntryPoint = exports.isESModule = void 0;
function isESModule() {
    let isESM = false;
    try {
        require("assert");
    }
    catch (error) {
        isESM = true;
        throw error;
    }
    return isESM;
}
exports.isESModule = isESModule;
const entryPointMap = {
    ESM: "ModuleJob.run",
    CJS: "Module._compile",
};
function getDefaultEntryPoint() {
    const isESM = isESModule();
    return isESM ? entryPointMap.ESM : entryPointMap.CJS;
}
exports.getDefaultEntryPoint = getDefaultEntryPoint;

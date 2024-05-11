// if (typeof process === "object" && typeof window === "undefined") {
//   // module.exports = require("./lib/logger")
//   const a = import("./node");
// } else {
//   const a = import("./browser");
// }
import { NodeLogger } from "./node";
export { NodeLogger };

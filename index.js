const { log, logDiff, Logger } = require("./logger");

// const sample = "Hi";

// console.log({ sample });

// const sampleObj = { HI: "Hi World" };
// console.log(JSON.stringify({ sampleObj }, null, 2));

// console.log(fooFx());
//hoisting works only for function declarations, not expressions
// function foo() - declarations
// const fooFx = function foo() expressions
// console.log(foo());
const fooFx = function foo() {
  const a = "A";
  log({ a });
};

// function main() {
//   fooFx();
//   console.log(fooFx.caller);
// }

fooFx();
// foo()
// console.log(fooFx.caller);
// main();

const justAVariable = { 1: "1" };
log(justAVariable);

class FooObject {
  constructor() {
    this.foo = "foo";
    this.bar = "bar";
  }
}

const foo1 = new FooObject();
const foo2 = new FooObject();

foo1.uniqueProp = "foo bar 1";
foo2.moreUniqueProp = "foo bar 2";

logDiff(foo1, foo2);
console.log("----------\n");
log({ foo1, foo2 }).diff();

console.log("\n------Logger-------\n");
const logger = new Logger();
logger.log({ foo1 });
logger.log({ foo1, foo2 }).diff();

//gol log({foo1, foo2}).diff()

const bar = { name: "foo" };

// logger.log({ bar.name})

const nestedArr = () => {
  // logger.log({foo1})
  const outerFoo = [1, 2, 3];
  const fooArr = [{ 1: "one" }, { 2: "two" }, { 3: "three" }];
  outerFoo.some((foo) => {
    fooArr.find((ele) => {
      // console.log("mapped ele: ", ele);
      logger.log({ ele }, { ignoreIterators: true });
    });
  });
};

// logger.log({a:"a"}, {options: {
//   //default false
//   ignoreArrayMethods: true;
// }})

nestedArr();

// const deeplyNestedMain = () => {
//   const outerFunc = () => {
//     const innerFunc = () => {
//       const innerVal = { inner: "peace" };
//       logger.log({ innerVal });
//     };

//     innerFunc();
//   };
//   outerFunc();
// };
// deeplyNestedMain();

// const nestedPlusArray = () => {
//   const arr = [1, 2, 3];

//   arr.forEach((e) => {
//     logger.log({e});
//   });
// };

// nestedPlusArray();

const m1 = new Map();

m1.set("1", "one");
m1.set("1", "ON#");
m1.set(1, "uno");

m1.forEach((v, k) => {
  logger.log({ [k]: v });
});


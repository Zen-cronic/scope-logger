const { Logger } = require("./logger");


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

const logger = new Logger();


console.log("\n------Logger-------\n");

logger.log({ foo1 });

  //edge case
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

// nestedArr();

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

const nestedPlusArray = () => {
  const arr = [1, 2, 3];

  arr.forEach((e) => {
    logger.log({e}, {ignoreIterators: true});
    // logger.log({e}, {ignoreIterators: false});
    // logger.log({e});
    // logger.args = null
  });
};

nestedPlusArray();

const m1 = new Map();

m1.set("1", "one");
m1.set("1", "ON#");
m1.set(1, "uno");

m1.forEach((v, k) => {
  logger.log({ [k]: v });
});

const oneArr = [1,2,3]

const oneLayerArr = () => {
  oneArr.forEach((ele)  => {
    logger.log({ele}, {ignoreIterators: true})
  })
 
}

oneLayerArr()

//Logger
// console.log(logger.constructor);
// {}
// console.log(logger.constructor.prototype);
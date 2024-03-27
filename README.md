# scope-logger

# What it does

Logs a variable and a sequence of scopes through which it's accessed. It automatically logs the name of the variable. A NodeJs logger. Inspired by the debug library.

# Why??

Too lazy to write `console.log("variableName %o", variableValue)` :))
The same effect can be achieved with `console.log({variable})` => `$ variableName: variableValue`  
But this logger shows the **sequence of scopes**(i.e., functions) from the variable is logged, a feature that I wished I had when I was logging many different variables.

# Example

```javascript
function outerFn() {
  function innerFn() {
    const logger = new Logger("lazy-log");

    const foofoo = "barbar";
    logger.log({ foofoo });
  }

  innerFn();
}

outerFn();
```

Output:
![usage-sample-output](https://github.com/Zen-cronic/scope-logger/assets/83657429/bc54bf1d-3609-4cb4-a00c-d811c2038c54)

# Installation

`$ npm install scope-logger`

# Usage

1. Create an instance of `Logger`. Namespace and options are optional args for constructor.

2. Pass the variable you want to log to the `log` method inside **curly brackets** `{}`!

# Configuration Options

1. **ignoreIterators** (boolean): set `true` to omit the native iterator calls (e.g., Array.forEach) in the scope log statement. This applies to all types of array-like iterators available in JS and NodeJs such as Map, Set, Array, Int8Array, and so on.

```javascript
function outerFn() {
  function innerFn() {
    const logger = new Logger("Server");

    const testArr = [1, 2, 3];
    testArr.forEach((val) => {
      logger.log({ val });
    });
  }

  innerFn();
}

outerFn();
```

_Default output:_

![ignore-iterators](https://github.com/Zen-cronic/scope-logger/assets/83657429/83a8abe0-2a95-4372-8d3d-ae629ded3a85)

```javascript
testArr.forEach((val) => {
  logger.log({ val }, { ignoreIterators });
});
```

_Configured output: `Array.forEach` is omitted_

![ignore-iterators-enabled](https://github.com/Zen-cronic/scope-logger/assets/83657429/94f10f12-5adc-4f7f-8315-b55e2f84163a)



2. **onlyFirstElem** (boolean): set to `true` to log only the first element in an iterator call. This is useful in scenarios where you only care about the scope journey of a variable in the iterator call, but **not** about the value of each variable.

All the elements would have the same scope signature, therefore it's redundant to print all those logs. The non-first variables are not logged. This applies recursively for nested iterator calls.

```javascript
function main() {
  const outerArr = [1, 2, 3];
  const innerArr = [1, 2, 3];

  outerArr.forEach(() => {
    innerArr.map((val) => {
      logger.log({ val });
    });
  });
}

main();
```

_Default output: The following 3 lines x 3 = 9 logs in total_

![only-first-elem](https://github.com/Zen-cronic/scope-logger/assets/83657429/3a9a61f6-0bc0-433e-99b2-52ea8ea16aef)

```javascript
outerArr.forEach(() => {
  innerArr.map((val) => {
    logger.log({ val }, { onlyFirstElem: true });
  });
});
```

_Configured output: Only the first element is logged_

![only-first-elem-enabled](https://github.com/Zen-cronic/scope-logger/assets/83657429/56607c75-625f-45ab-a9c8-846cb2c81d85)

_The default configuration:_

```javascript
  {
    ignoreIterators: false,
    onlyFirstElem: false
  }

```

---

# Limitations

1. Cannot pass a property of an object. Because the library is based on JS object destructing (`console.log({foo})` outputs the same as `console.log({foo: <value>})`).

- Where `foo.name = "bar"` Cannot type `logger.log({foo.name})`. This will throw a syntax error.

# Test

`$ npm run test`

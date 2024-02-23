/**
 *
 * @param {string} callStack
 */
// function callStackParser(callStack, splitIndex = 3, canRecurse =true) {

// const callStackParts =  callStack.split("\n")
//     if(splitIndex>= callStackParts.length){
//         return null
//     }
//   const nativeFunctionCalleeLine = callStackParts[splitIndex].trim();
//   const nativeFunctionCallee = nativeFunctionCalleeLine
//     .split(/at /)[1]
//     .split(/\s/)[0];

//   //Array.fx || fx || sth

//   console.log("nativeFunction callee: ", nativeFunctionCallee  );
//   const [nativeDataType, nativeFunction] = nativeFunctionCallee.split(".");

//   //val, undefined when the parent fx reached
//   console.log(nativeDataType, nativeFunction);
//   let logTitle = `From _${nativeDataType}.${nativeFunction}_ `;

//   if (nativeDataType === "Array") {
//     splitIndex += 2

//     console.log({logTitle});

//     const appendedLogTitle = callStackParser(callStack, splitIndex, true)
//     if(appendedLogTitle){
//         logTitle += appendedLogTitle
//     }
//     // logTitle.concat(callStackParser(callStack, splitIndex))

//     // console.log(logTitle);
//     // console.log(JSON.stringify(args, null, 2));
//   }

//   //not Array.fx - call jsut once
//   else{
//     console.log("OUT of nested loop");

//     console.log("splitIndex: ", splitIndex);
//     if(canRecurse){
//     console.log("last recursive call");
//         // splitIndex = splitIndex-2
//         splitIndex--
//         const appendedLogTitle = callStackParser(callStack, splitIndex, false)
//         console.log("appendeLogTitle: ", appendedLogTitle);
//         if(appendedLogTitle){
//             // logTitle += appendedLogTitle
//             logTitle += nativeDataType

//             return logTitle
//         }
//     }
//     return null
//     // return nativeDataType

//   }

// //   console.log("outside if:",{logTitle});
// //   return nativeFunction ? logTitle : nativeFunctionCallee
//   //   else{
//   //not from a loop therefore, jsut a funnction
//   // console.log(`callee Stack: ${calleeStack} `);

//   return logTitle
// }

// /**
//  *
//  * @param {string} callStack
//  * @returns {string}
//  */
// function callStackParser(callStack) {
//   const callStackParts = callStack.split("\n");

//   //starts from 2
//   let splitIndex = 2;
//   let logTitle = "";
//   const callStackLength = callStackParts.length;

//   let calleeLine = callStackParts[splitIndex].trim();
//   let [dataType, dataFunc] = calleeLine.split(/at /)[1]
//   .split(/\s/)[0].split(".")

//   do {
//     // console.log(callStackParts[splitIndex].trim().startsWith("at Module._compile") );
//     if (splitIndex === callStackLength - 1) {
//       return null;
//     }
//     console.log({ logTitle });
//     console.log({ splitIndex });
//     const arrayFuncCalleeLine = callStackParts[splitIndex + 1]
//       .trim()
//       .split(/at /)[1]
//       .split(/\s/)[0];

//     const [arrDataType, arrDataFunc] = arrayFuncCalleeLine.split(".");

//     console.log({ dataType });
//     if (arrDataType === "Array") {
//       calleeLine = arrayFuncCalleeLine;
//       logTitle = logTitle.concat(`From __${arrDataType}.${arrDataFunc}__ `);
//       splitIndex += 2;
//     } else {
//               logTitle = logTitle.concat(`From __${dataType}__ `);
//       calleeLine = callStackParts[splitIndex + 1]
//         .trim()
//         .split(/at /)[1]
//         .split(/\s/)[0];

//         // logTitle = logTitle.concat(`From __${dataType}__ `);
//         splitIndex++;
//     }
//   } while (!callStackParts[splitIndex].trim().startsWith("at Module._compile"));

//   return logTitle;
// }

//v3
// /**
//  *
//  * @param {string} callStack
//  */

// function callStackParser(callStack) {
//   const callStackParts = callStack.split("\n");
//   const callStackLength = callStackParts.length;

//   let splitIndex = 2;

//   let currentLine = callStackParts[splitIndex].trim();

//   //default
//   // let logTitle = `${currentLine.split(/at /)[1].split(/\s/)[0]}`
//   let logTitle = "";

//   while(!currentLine.includes("Module._compile")){
//   // while (true) {
//     if (!callStackParts[splitIndex]) {
//       // return null - whole function gets return
//       break;
//     }
//     let currentLineParts = callStackParts[splitIndex].trim().split(" ");

//     if (currentLineParts[1] === "Module._compile") {
//       // return null;
//       break;
//     }

//     //if 3 take [1] as fx
//     //Does NOT concat
//     if (currentLineParts.length === 2) {
//       // console.log("the below is an array method");
//       splitIndex++;
//     } else {
//       if (currentLineParts[1].includes("Array.")) {
//         const arrFx = currentLineParts[1].split(".").pop();

//         logTitle = logTitle.concat(`From _Array.${arrFx}_ -> `);
//         // splitIndex += 2
//         splitIndex++;
//       } else {
//         logTitle = logTitle.concat(`From _${currentLineParts[1]}_ -> `);
//         splitIndex++;
//       }

//       // splitIndex++
//     }
//   }

//   return logTitle;
// }

// v4
/**
 *
 * @param {string} callStack
 */

function callStackParser(callStack) {
  const callStackParts = callStack.split("\n");
  const callStackPartsLen = callStackParts.length;

  let splitIndex = 2;
  let logTitle = "";

  for (; splitIndex < callStackPartsLen; splitIndex++) {
    if (!callStackParts[splitIndex]) {
      break;
    }
    let currentLineParts = callStackParts[splitIndex].trim().split(" ");

    if (currentLineParts[1] === "Module._compile") {
      break;
    }

    const currentLinePartsLeng = currentLineParts.length;

    if (currentLinePartsLeng === 3) {
      const calleeFunc = currentLineParts[1];

      if (calleeFunc.includes("Array.")) {
        const arrFx = calleeFunc.split(".").pop();

        logTitle = logTitle.concat(`From _Array.${arrFx}_ -> `);
        // splitIndex += 2
      } else {
        logTitle = logTitle.concat(`From _${calleeFunc}_ -> `);
      }
    }
  }

  return logTitle;
}

module.exports = {
  callStackParser,
};

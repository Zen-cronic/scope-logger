afterEach(async () => {
  testCaseNum++;

  let hasExited = false;

  workerProcess.on("exit", (code) => {
    console.log(`Worker process exited ${code}`);
    hasExited = true;
  });

  return new Promise((resolve, reject) => {
    // If the worker process has already exited, resolve the Promise immediately
    if (hasExited) {
      resolve();
      return;
    }

    // Otherwise, try to kill the worker process
    try {
      workerProcess.kill();
    } catch (error) {
      reject(error);
    }

    // If the worker process still hasn't exited after a delay, reject the Promise
    setTimeout(() => {
      if (!hasExited) {
        reject(new Error("Worker process did not exit"));
      }
    }, 5000); // Adjust this delay as needed
  });
});

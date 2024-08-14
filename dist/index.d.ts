type LogOptions = {
  ignoreIterators?: boolean;
  onlyFirstElem?: boolean;
  entryPoint?: string;
};

type LogReturn = {
  stack: string | null;
  logTitle: string | null;
  logBody: string | null;
};

export declare class Logger {
  /**
   *
   * @param namespace - The grouping name of a logger instance.
   * @param options - Configure how the variable will be logged at a constructor level.
   */
  constructor(namespace: string, options?: LogOptions);

  /**
   *
   * @param args - The variable to be logged passed using the `{ }` syntax.
   * @param options - Configure how the variable will be logged with each method call.
   */
  log(args: Object, options?: LogOptions): LogReturn;

  /**
   * Call to disable all the logging of a namespaced logger.
   */
  disableAll(): this;
}

//mainly testHelper.ts
export type WorkerNonErrorMessage = { length: number };
export type WorkerErrorMessage = { error: string };
export type WorkerMessage = WorkerErrorMessage | WorkerNonErrorMessage;

//worker proc files
export type NonNullProcessSend = NonNullable<typeof process.send>;

export type FileExt = "js" | "ts";

export type DefaultEntryPoint = "ModuleJob.run" | "Module._compile";

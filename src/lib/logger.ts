// lib/logger.ts
export const ts = () => new Date().toISOString();

export const dbg = {
  info: (scope: string, msg: string, data?: unknown) =>
    console.log(`[MD][${scope}] ${ts()} — ${msg}`, data ?? ""),
  warn: (scope: string, msg: string, data?: unknown) =>
    console.warn(`[MD][${scope}] ${ts()} — ${msg}`, data ?? ""),
  error: (scope: string, msg: string, data?: unknown) =>
    console.error(`[MD][${scope}] ${ts()} — ${msg}`, data ?? ""),
  group: (scope: string, title: string, data?: unknown) => {
    console.groupCollapsed(`[MD][${scope}] ${ts()} — ${title}`);
    if (data !== undefined) console.log(data);
    console.groupEnd();
  },
};

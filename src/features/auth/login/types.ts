import type { LoginSchema } from "./schema";

export type LoginFormValues = LoginSchema;

export type LoginResult = {
  ok: boolean;
  message?: string;
};

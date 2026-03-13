import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import * as z from "zod";

type keyReqType = keyof Request;
type SchemaType = Partial<Record<keyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, _res: Response, next: NextFunction): NextFunction => {
    const validationErrors: Array<{
      key: keyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const key of Object.keys(schema) as keyReqType[]) {
      if (!schema[key]) continue;

      const validationResults = schema[key].safeParse(req[key]);
      if (!validationResults.success) {
        const errors = validationResults.error as ZodError;
        validationErrors.push({
          key,
          issues: errors.issues.map((issue: any) => {
            return { message: issue.message, path: issue.path };
          }),
        });
      }
    }
    return next() as unknown as NextFunction;
  };
};

export const generalFields = {
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long " })
    .max(30, { error: "Username must be at most 30 characters long " }), // default required
  email: z.email({ error: "Invalid email address" }),
  password: z.string(),
  confirmPassword: z.string(),
  otp: z.string().regex(/^\d{6}$/, { message: "OTP must be a 6-digit number" }),
};
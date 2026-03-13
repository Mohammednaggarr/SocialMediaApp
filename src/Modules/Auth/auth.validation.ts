import * as z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};

export const resendConfirmEmailSchema = {
  body: z.strictObject({
    email: generalFields.email,
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
    })
    .superRefine((data: any, ctx: any) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
      //! user name 2 words
      if (data.username?.split(" ").length !== 2) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Username must be at least 2 words",
        });
      }
    }),
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  // }),
};
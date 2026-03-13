import * as z from "zod";
import {
  confirmEmailSchema,
  loginSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "./auth.validation";

// get the interface from our validation schema
export type ISignupDTO = z.infer<typeof signupSchema.body>;
export type ILoginDTO = z.infer<typeof loginSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type IResendConfirmEmailDTO = z.infer<
  typeof resendConfirmEmailSchema.body
>;
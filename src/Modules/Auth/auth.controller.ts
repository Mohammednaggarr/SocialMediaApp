import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import {
  confirmEmailSchema,
  loginSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "./auth.validation";

const router: Router = Router();

router.post("/signup", validation(signupSchema), authService.signup);
router.post("/login", validation(loginSchema), authService.login);
router.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  authService.confirmEmail
);
router.patch(
  "/resend-confirm-email",
  validation(resendConfirmEmailSchema),
  authService.resendConfirmEmail
);

export default router;
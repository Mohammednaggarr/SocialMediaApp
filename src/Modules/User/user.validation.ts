import * as z from "zod";
import { LogoutEnum } from "../../Utils/Security/token";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid MongoDB ObjectId" });

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY),
  }),
};

export const friendRequestSchema = {
  params: z.object({ id: mongoId }),
};

export const sendDirectMessageSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    message: z.string().min(1, { message: "Message cannot be empty" }),
  }),
};

export const getDirectMessagesSchema = {
  params: z.object({ id: mongoId }),
};
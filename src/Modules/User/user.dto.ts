import * as z from "zod";
import {
  logoutSchema,
  friendRequestSchema,
  sendDirectMessageSchema,
  getDirectMessagesSchema,
} from "./user.validation";

export type LogoutDTO = z.infer<typeof logoutSchema.body>;

export type IFriendRequestParams = z.infer<typeof friendRequestSchema.params>;

export type ISendDirectMessageParams = z.infer<typeof sendDirectMessageSchema.params>;
export type ISendDirectMessageBody = z.infer<typeof sendDirectMessageSchema.body>;

export type IGetDirectMessagesParams = z.infer<typeof getDirectMessagesSchema.params>;
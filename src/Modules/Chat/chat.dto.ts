import * as z from "zod";
import {
  sendDirectMessageSchema,
  getDirectMessagesSchema,
  createGroupSchema,
  getGroupMessagesSchema,
} from "./chat.validation";

export type ISendDirectMessageParams = z.infer<typeof sendDirectMessageSchema.params>;
export type ISendDirectMessageBody = z.infer<typeof sendDirectMessageSchema.body>;

export type IGetDirectMessagesParams = z.infer<typeof getDirectMessagesSchema.params>;

export type ICreateGroupBody = z.infer<typeof createGroupSchema.body>;

export type IGetGroupMessagesParams = z.infer<typeof getGroupMessagesSchema.params>;

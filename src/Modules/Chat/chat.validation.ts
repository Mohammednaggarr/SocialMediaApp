import * as z from "zod";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid MongoDB ObjectId" });

export const sendDirectMessageSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    message: z.string().min(1, { message: "Message cannot be empty" }),
  }),
};

export const getDirectMessagesSchema = {
  params: z.object({ id: mongoId }),
};

export const createGroupSchema = {
  body: z.object({
    name: z.string().min(1, { message: "Group name is required" }),
    participants: z
      .array(mongoId)
      .min(1, { message: "At least one participant is required" }),
  }),
};

export const getGroupMessagesSchema = {
  params: z.object({ groupId: mongoId }),
};

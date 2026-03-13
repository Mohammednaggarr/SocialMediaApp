import * as z from "zod";

const mongoIdRegex = /^[a-f\d]{24}$/i;
const mongoId = z.string().regex(mongoIdRegex, { message: "Invalid MongoDB ObjectId" });

export const createPostSchema = {
  body: z.object({
    content: z.string().min(1, { message: "Content is required" }),
    tags: z.array(mongoId).optional(),
  }),
};

export const getPostsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
};

export const reactPostSchema = {
  params: z.object({ id: mongoId }),
  query: z.object({
    action: z.enum(["LIKE", "UNLIKE"]),
  }),
};

export const commentPostSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    content: z.string().min(1, { message: "Comment content is required" }),
  }),
};

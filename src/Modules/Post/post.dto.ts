import * as z from "zod";
import {
  createPostSchema,
  getPostsSchema,
  reactPostSchema,
  commentPostSchema,
} from "./post.validation";

export type ICreatePostDTO = z.infer<typeof createPostSchema.body>;

export type IGetPostsDTO = z.infer<typeof getPostsSchema.query>;

export type IReactPostParams = z.infer<typeof reactPostSchema.params>;
export type IReactPostQuery = z.infer<typeof reactPostSchema.query>;

export type ICommentPostParams = z.infer<typeof commentPostSchema.params>;
export type ICommentPostBody = z.infer<typeof commentPostSchema.body>;

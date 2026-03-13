import { Model } from "mongoose";
import { IPost } from "../models/post.model";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../Utils/Response/error.response";

export class PostRepository extends DatabaseRepository<IPost> {
  constructor(protected override readonly model: Model<IPost>) {
    super(model);
  }

  async createPost({ data }: { data: Partial<IPost> }) {
    const [post] = (await this.create({ data: [data] })) || [];
    if (!post) throw new BadRequestException("Failed to create post");
    return post;
  }
}

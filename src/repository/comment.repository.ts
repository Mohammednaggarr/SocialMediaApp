import { Model } from "mongoose";
import { IComment } from "../models/comment.model";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../Utils/Response/error.response";

export class CommentRepository extends DatabaseRepository<IComment> {
  constructor(protected override readonly model: Model<IComment>) {
    super(model);
  }

  async createComment({ data }: { data: Partial<IComment> }) {
    const [comment] = (await this.create({ data: [data] })) || [];
    if (!comment) throw new BadRequestException("Failed to create comment");
    return comment;
  }
}

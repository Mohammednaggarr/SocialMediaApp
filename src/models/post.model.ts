import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IPost {
  _id: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  tags: Types.ObjectId[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt?: Date;
}

export const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const PostModel = models.Post || model<IPost>("Post", postSchema);

export type PostDocument = HydratedDocument<IPost>;

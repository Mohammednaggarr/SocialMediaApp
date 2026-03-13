import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

export const CommentModel =
  models.Comment || model<IComment>("Comment", commentSchema);

export type CommentDocument = HydratedDocument<IComment>;

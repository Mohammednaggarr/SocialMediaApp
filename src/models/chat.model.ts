import { HydratedDocument, model, models, Schema, Types } from "mongoose";

// ─── Direct Message ─────────────────────────────────────────────────────────

export interface IDirectMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt?: Date;
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const DirectMessageModel =
  models.DirectMessage ||
  model<IDirectMessage>("DirectMessage", directMessageSchema);

export type DirectMessageDocument = HydratedDocument<IDirectMessage>;

// ─── Group Chat ──────────────────────────────────────────────────────────────

export interface IGroupMessage {
  sender: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IGroupChat {
  _id: Types.ObjectId;
  name: string;
  participants: Types.ObjectId[];
  messages: IGroupMessage[];
  createdAt: Date;
  updatedAt?: Date;
}

const groupMessageSchema = new Schema<IGroupMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const groupChatSchema = new Schema<IGroupChat>(
  {
    name: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [groupMessageSchema],
  },
  { timestamps: true }
);

export const GroupChatModel =
  models.GroupChat || model<IGroupChat>("GroupChat", groupChatSchema);

export type GroupChatDocument = HydratedDocument<IGroupChat>;

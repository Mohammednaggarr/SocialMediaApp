import { Request, Response } from "express";
import { Types } from "mongoose";
import { DirectMessageModel, GroupChatModel } from "../../models/chat.model";
import { DirectMessageRepository } from "../../repository/chat.repository";
import { GroupChatRepository } from "../../repository/group-chat.repository";
import { NotFoundException } from "../../Utils/Response/error.response";
import { getIO } from "../../Utils/Socket/socket.service";
import {
  ISendDirectMessageParams,
  ISendDirectMessageBody,
  IGetDirectMessagesParams,
  ICreateGroupBody,
  IGetGroupMessagesParams,
} from "./chat.dto";

class ChatService {
  private _directMsgModel = new DirectMessageRepository(DirectMessageModel);
  private _groupChatModel = new GroupChatRepository(GroupChatModel);

  getDirectMessages = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IGetDirectMessagesParams = req.params as unknown as IGetDirectMessagesParams;
    const userId = req.decoded?._id as string;

    const messages = await this._directMsgModel.find({
      filter: {
        $or: [
          { sender: new Types.ObjectId(userId), receiver: new Types.ObjectId(id) },
          { sender: new Types.ObjectId(id), receiver: new Types.ObjectId(userId) },
        ],
      },
      sort: { createdAt: 1 },
    });

    return res.status(200).json({
      message: "Direct messages fetched successfully",
      data: { messages },
    });
  };

  sendDirectMessage = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ISendDirectMessageParams = req.params as unknown as ISendDirectMessageParams;
    const { message }: ISendDirectMessageBody = req.body;
    const userId = req.decoded?._id as string;

    const newMessage = await this._directMsgModel.createMessage({
      data: {
        sender: new Types.ObjectId(userId),
        receiver: new Types.ObjectId(id),
        message,
      },
    });

    // Emit the message in real-time to the receiver's personal room
    try {
      getIO().to(id).emit("receive_message", {
        from: userId,
        to: id,
        message,
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
      });
    } catch {
      // Socket.IO may not be initialized in test environments
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: { message: newMessage },
    });
  };

  getGroupMessages = async (req: Request, res: Response): Promise<Response> => {
    const { groupId }: IGetGroupMessagesParams = req.params as unknown as IGetGroupMessagesParams;

    const group = await this._groupChatModel.findById({
      id: groupId,
      options: {
        populate: [
          { path: "participants", select: "username profileImage" },
          { path: "messages.sender", select: "username profileImage" },
        ],
      },
    });

    if (!group) throw new NotFoundException("Group chat not found");

    return res.status(200).json({
      message: "Group messages fetched successfully",
      data: { group },
    });
  };

  createGroup = async (req: Request, res: Response): Promise<Response> => {
    const { name, participants }: ICreateGroupBody = req.body;
    const creatorId = req.decoded?._id as string;

    const uniqueParticipants = [
      ...new Set([
        creatorId,
        ...participants,
      ]),
    ].map((id) => new Types.ObjectId(id));

    const group = await this._groupChatModel.createGroup({
      data: {
        name,
        participants: uniqueParticipants,
        messages: [],
      },
    });

    return res.status(201).json({
      message: "Group chat created successfully",
      data: { group },
    });
  };
}

export default new ChatService();

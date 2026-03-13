import { Request, Response } from "express";
import { Types, UpdateQuery } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { IUser, UserModel } from "../../models/user.model";
import { DirectMessageModel } from "../../models/chat.model";
import { UserRepository } from "../../repository/user.repository";
import { DirectMessageRepository } from "../../repository/chat.repository";
import {
  LogoutDTO,
  IFriendRequestParams,
  ISendDirectMessageParams,
  ISendDirectMessageBody,
  IGetDirectMessagesParams,
} from "./user.dto";
import { createRevokedToken, LogoutEnum } from "../../Utils/Security/token";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Response/error.response";
import {
  createPresignedUrl,
  uploadFiles,
} from "../../Utils/multer/s3.config";
import { getIO } from "../../Utils/Socket/socket.service";

class UserService {
  private _userModel = new UserRepository(UserModel);
  private _directMsgModel = new DirectMessageRepository(DirectMessageModel);

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: "User profile fetched successfully",
      data: {
        user: req.user,
        decoded: req.decoded,
      },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDTO = req.body;
    let statusCode: number = 200;
    const update: UpdateQuery<IUser> = {};
    switch (flag) {
      case LogoutEnum.ONLY:
        await createRevokedToken(req.decoded as JwtPayload);
        statusCode = 201;
        break;
      case LogoutEnum.ALL:
        update.changeCredentialsTime = new Date();
        break;
      default:
        break;
    }

    await this._userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update,
    });

    return res.status(statusCode).json({
      message: "User logout successfully",
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    //! upload to cloudinary or s3

    //^ upload normal files (max 5MB)
    // const key = await uploadFile({
    //   path: `users/${req.decoded?._id}`,
    //   file: req.file as Express.Multer.File,
    // });

    //^ upload large files using multipart upload
    // const key = await uploadLargeFile({
    //   path: `users/${req.decoded?._id}`,
    //   file: req.file as Express.Multer.File,
    // });

    //^ presigned upload

    const {
      ContentType,
      Originalname,
    }: { ContentType: string; Originalname: string } = req.body;

    const { url, Key } = await createPresignedUrl({
      ContentType,
      Originalname,
      path: `users/${req.decoded?._id}`,
    });

    await this._userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update: {
        profileImage: Key,
      },
    });

    return res.status(200).json({
      message: "User Image uploaded successfully",
      url,
    });
  };

  coverImage = async (req: Request, res: Response): Promise<Response> => {
    const urls = await uploadFiles({
      files: (req as any).files as any[],
      path: `users/${req.decoded?._id}/cover`,
    });

    await this._userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update: {
        coverImages: [urls],
      },
    });

    return res.status(200).json({
      message: "User Image uploaded successfully",
    });
  };

  sendFriendRequest = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IFriendRequestParams = req.params as unknown as IFriendRequestParams;
    const senderId = req.decoded?._id as string;

    if (senderId === id) {
      throw new BadRequestException("You cannot send a friend request to yourself");
    }

    const recipient = await this._userModel.findById({ id, select: "_id friendRequests" });
    if (!recipient) throw new NotFoundException("User not found");

    const senderObjectId = new Types.ObjectId(senderId);
    const recipientObjectId = new Types.ObjectId(id);

    const alreadySent = recipient.friendRequests.some((reqId) =>
      reqId.equals(senderObjectId)
    );
    if (alreadySent) {
      throw new BadRequestException("Friend request already sent");
    }

    await Promise.all([
      this._userModel.findByIdAndUpdate({
        id,
        update: { $push: { friendRequests: senderObjectId } },
      }),
      this._userModel.findByIdAndUpdate({
        id: senderId,
        update: { $push: { sentRequests: recipientObjectId } },
      }),
    ]);

    return res.status(200).json({
      message: "Friend request sent successfully",
    });
  };

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
      message: "Messages fetched successfully",
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

    try {
      getIO().to(id).emit("receive_message", {
        from: userId,
        to: id,
        message,
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
      });
    } catch {
      // Socket.IO may not be available in all environments
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: { message: newMessage },
    });
  };
}
export default new UserService();
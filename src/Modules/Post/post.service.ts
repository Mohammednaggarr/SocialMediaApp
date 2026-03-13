import { Request, Response } from "express";
import { Types } from "mongoose";
import { PostModel } from "../../models/post.model";
import { CommentModel } from "../../models/comment.model";
import { UserModel } from "../../models/user.model";
import { PostRepository } from "../../repository/post.repository";
import { CommentRepository } from "../../repository/comment.repository";
import { UserRepository } from "../../repository/user.repository";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Response/error.response";
import {
  ICreatePostDTO,
  IGetPostsDTO,
  IReactPostParams,
  IReactPostQuery,
  ICommentPostParams,
  ICommentPostBody,
} from "./post.dto";

class PostService {
  private _postModel = new PostRepository(PostModel);
  private _commentModel = new CommentRepository(CommentModel);
  private _userModel = new UserRepository(UserModel);

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content, tags }: ICreatePostDTO = req.body;
    const createdBy = req.decoded?._id as string;

    if (tags && tags.length > 0) {
      const taggedUsers = await this._userModel.find({
        filter: { _id: { $in: tags } },
        select: "_id",
      });

      if (taggedUsers.length !== tags.length) {
        throw new BadRequestException("One or more tagged users do not exist");
      }
    }

    const post = await this._postModel.createPost({
      data: {
        content,
        createdBy: new Types.ObjectId(createdBy),
        tags: tags?.map((id) => new Types.ObjectId(id)) ?? [],
      },
    });

    return res.status(201).json({
      message: "Post created successfully",
      data: { post },
    });
  };

  getPosts = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit }: IGetPostsDTO = req.query as unknown as IGetPostsDTO;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      this._postModel.find({
        sort: { createdAt: -1 },
        skip,
        limit: limitNum,
        options: {
          populate: [
            { path: "createdBy", select: "username profileImage" },
            { path: "tags", select: "username profileImage" },
            { path: "comments", populate: { path: "createdBy", select: "username profileImage" } },
          ],
        },
      }),
      this._postModel.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Posts fetched successfully",
      data: {
        posts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  };

  reactPost = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IReactPostParams = req.params as unknown as IReactPostParams;
    const { action }: IReactPostQuery = req.query as unknown as IReactPostQuery;
    const userId = req.decoded?._id as string;

    const post = await this._postModel.findById({ id });
    if (!post) throw new NotFoundException("Post not found");

    const userObjectId = new Types.ObjectId(userId);
    const alreadyLiked = post.likes.some((likeId) =>
      likeId.equals(userObjectId)
    );

    if (action === "LIKE") {
      if (alreadyLiked)
        throw new BadRequestException("You already liked this post");

      await this._postModel.findByIdAndUpdate({
        id,
        update: { $push: { likes: userObjectId } },
      });
    } else {
      if (!alreadyLiked)
        throw new BadRequestException("You have not liked this post");

      await this._postModel.findByIdAndUpdate({
        id,
        update: { $pull: { likes: userObjectId } },
      });
    }

    const updatedPost = await this._postModel.findById({ id, select: "likes" });

    return res.status(200).json({
      message: `Post ${action === "LIKE" ? "liked" : "unliked"} successfully`,
      data: { likesCount: updatedPost?.likes.length ?? 0 },
    });
  };

  commentPost = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICommentPostParams = req.params as unknown as ICommentPostParams;
    const { content }: ICommentPostBody = req.body;
    const userId = req.decoded?._id as string;

    const post = await this._postModel.findById({ id, select: "_id" });
    if (!post) throw new NotFoundException("Post not found");

    const comment = await this._commentModel.createComment({
      data: {
        content,
        createdBy: new Types.ObjectId(userId),
        post: new Types.ObjectId(id),
      },
    });

    await this._postModel.findByIdAndUpdate({
      id,
      update: { $push: { comments: comment._id } },
    });

    return res.status(201).json({
      message: "Comment added successfully",
      data: { comment },
    });
  };
}

export default new PostService();

import { Router } from "express";
import postService from "./post.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { RoleEnum } from "../../models/user.model";
import {
  createPostSchema,
  getPostsSchema,
  reactPostSchema,
  commentPostSchema,
} from "./post.validation";

const router: Router = Router();

router.post(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(createPostSchema),
  postService.createPost
);

router.get(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getPostsSchema),
  postService.getPosts
);

router.patch(
  "/:id/react",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(reactPostSchema),
  postService.reactPost
);

router.post(
  "/:id/comment",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(commentPostSchema),
  postService.commentPost
);

export default router;

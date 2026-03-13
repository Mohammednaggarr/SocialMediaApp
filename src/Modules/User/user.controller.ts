import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { RoleEnum } from "../../models/user.model";
import {
  cloudFileUpload,
  filleValidation,
  StorageEnum,
} from "../../Utils/multer/cloud.multer";
import {
  friendRequestSchema,
  sendDirectMessageSchema,
  getDirectMessagesSchema,
} from "./user.validation";

const router: Router = Router();

router.get(
  "/get-profile",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.getProfile
);

router.post(
  "/logout",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.logout
);

router.patch(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...filleValidation.images],
    storageApproach: StorageEnum.MEMORY,
    maxFileSize: 5,
  }).single("profileImage"),
  userService.profileImage
);

router.patch(
  "/cover-images",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...filleValidation.images],
    storageApproach: StorageEnum.MEMORY,
    maxFileSize: 5,
  }).array("coverImage", 5),
  userService.coverImage
);

router.post(
  "/:id/friend-request",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(friendRequestSchema),
  userService.sendFriendRequest
);

router.get(
  "/:id/chat",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getDirectMessagesSchema),
  userService.getDirectMessages
);

router.post(
  "/:id/chat",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(sendDirectMessageSchema),
  userService.sendDirectMessage
);

export default router;
import { Router } from "express";
import chatService from "./chat.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { TokenTypeEnum } from "../../Utils/Security/token";
import { RoleEnum } from "../../models/user.model";
import {
  createGroupSchema,
  getGroupMessagesSchema,
} from "./chat.validation";

const router: Router = Router();

router.post(
  "/group",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(createGroupSchema),
  chatService.createGroup
);

router.get(
  "/group/:groupId",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getGroupMessagesSchema),
  chatService.getGroupMessages
);

export default router;

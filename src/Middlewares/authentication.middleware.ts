import { NextFunction, Request, Response } from "express";
import { decodedToken, TokenTypeEnum } from "../Utils/Security/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../Utils/Response/error.response";
import { RoleEnum } from "../models/user.model";

export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
  accessRole: RoleEnum[] = []
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      throw new BadRequestException("Authorization header is missing");

    const { user, decoded } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    if (!accessRole.includes(user.role))
      throw new ForbiddenException("Access denied");

    req.user = user;
    req.decoded = decoded;

    return next();
  };
};
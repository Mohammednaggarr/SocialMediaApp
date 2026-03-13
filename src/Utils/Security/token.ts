import { JwtPayload, sign, SignOptions, verify } from "jsonwebtoken";
import { RoleEnum, UserModel, UserDocument } from "../../models/user.model";
import { v4 as uuid } from "uuid";
import {
  BadRequestException,
  NotFoundException,
  UnAuthorizedException,
} from "../Response/error.response";
import { UserRepository } from "../../repository/user.repository";
import { TokenRepository } from "../../repository/token.repository";
import { TokenModel } from "../../models/token.model";

export enum SignatureLevelEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}

export enum LogoutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

export const generateToken = async ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: string;
  options: SignOptions;
}): Promise<string> => {
  return await sign(payload, secret, options);
};

export const compareToken = async ({
  token,
  secret,
}: {
  token: string;
  secret: string;
}): Promise<JwtPayload> => {
  return (await verify(token, secret)) as JwtPayload;
};

//! get signature level
export const getSignatureLevel = async (role: RoleEnum = RoleEnum.USER) => {
  let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER;

  switch (role) {
    case RoleEnum.ADMIN:
      signatureLevel = SignatureLevelEnum.ADMIN;
      break;
    case RoleEnum.USER:
      signatureLevel = SignatureLevelEnum.USER;
      break;
    default:
      break;
  }

  return signatureLevel;
};

//& get signature
export const getSignature = async (
  signatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER
): Promise<{ access_token: string; refresh_token: string }> => {
  let signature: { access_token: string; refresh_token: string } = {
    access_token: "",
    refresh_token: "",
  };

  switch (signatureLevel) {
    case SignatureLevelEnum.ADMIN:
      signature.access_token = process.env.ACCESS_ADMIN_TOKEN_SECRET as string;
      signature.refresh_token = process.env
        .REFRESH_ADMIN_TOKEN_SECRET as string;
      break;
    case SignatureLevelEnum.USER:
      signature.access_token = process.env.ACCESS_USER_TOKEN_SECRET as string;
      signature.refresh_token = process.env.REFRESH_USER_TOKEN_SECRET as string;
      break;
    default:
      break;
  }

  return signature;
};

//^ create credentials
export const createLoginCredentials = async (
  user: UserDocument
): Promise<{ access_token: string; refresh_token: string }> => {
  const signatureLevel = await getSignatureLevel(user.role);
  const signature = await getSignature(signatureLevel);
  const jwtid = uuid();

  const access_token = await generateToken({
    payload: { _id: user._id },
    secret: signature.access_token,
    options: {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION_MS),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    secret: signature.refresh_token,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION_MS),
      jwtid,
    },
  });

  return { access_token, refresh_token };
};

//! decoded token
export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  authorization: string;
  tokenType: TokenTypeEnum;
}) => {
  const userModel = new UserRepository(UserModel);
  const tokenModel = new TokenRepository(TokenModel);

  const [bearer, token] = authorization.split(" ");
  if (!bearer || !token)
    throw new UnAuthorizedException("Invalid authorization format");

  const signature = await getSignature(bearer as SignatureLevelEnum);

  const decoded = await compareToken({
    token,
    secret:
      tokenType === TokenTypeEnum.ACCESS
        ? signature.access_token
        : signature.refresh_token,
  });
  if (!decoded?._id || !decoded?.iat)
    throw new UnAuthorizedException("Invalid token");

  if (await tokenModel.findOne({ filter: { jti: decoded.jti as string } }))
    throw new NotFoundException("Token has been revoked");

  const user = await userModel.findOne({
    filter: { _id: decoded._id },
  });

  if (!user) throw new NotFoundException("User not found");

  // Validate change credentials time to logout all sessions
  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw new UnAuthorizedException("Token is no longer valid");
  }

  return { user, decoded };
};

export const createRevokedToken = async (decoded: JwtPayload) => {
  const tokenModel = new TokenRepository(TokenModel);

  const [results] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn: decoded.exp as number,
          userId: decoded._id as string,
        },
      ],
    })) || [];

  if (!results) throw new BadRequestException("Failed to revoke token");

  return results;
};
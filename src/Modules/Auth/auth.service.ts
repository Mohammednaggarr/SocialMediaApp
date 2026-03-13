import { Request, Response } from "express";
import {
  IConfirmEmailDTO,
  ILoginDTO,
  IResendConfirmEmailDTO,
  ISignupDTO,
} from "./auth.dto";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Response/error.response";
import { UserModel } from "../../models/user.model";
import { UserRepository } from "../../repository/user.repository";
import { compareHash, generateHash } from "../../Utils/Security/hash";
import { generateOtp } from "../../Utils/Security/generate.otp";
import { emailEvent } from "../../Utils/Events/email.event";

import { createLoginCredentials } from "../../Utils/Security/token";

class AuthenticationService {
  private _userModel = new UserRepository(UserModel);

  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: ISignupDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });
    if (checkUser) throw new ConflictException("Email already exists");

    const otp = generateOtp();

    const user = await this._userModel.createUser({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmailOTP: {
            code: await generateHash(otp.toString()),
            createdAt: new Date(
              Date.now() + Number(process.env.OTP_EXPIRATION_MS)
            ),
          },
        },
      ],
      options: { validateBeforeSave: true },
    });

    emailEvent.emit("confirmEmail", {
      to: email,
      username,
      otp,
    });

    return res.status(201).json({ message: "user created successfully", user });
  };

  login = async (req: Request, res: Response) => {
    const { email, password }: ILoginDTO = req.body;

    const user = await this._userModel.findOne({
      filter: { email },
    });

    if (!user) throw new NotFoundException("user not found");

    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException("invalid credentials");
    }

    if (!user.confirmedAt) {
      throw new BadRequestException("please confirm your email to login");
    }

    const credentials = await createLoginCredentials(user);

    res.status(201).json({ message: "Logged in successfully", credentials });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });

    if (!user)
      throw new NotFoundException("Invalid request or email already confirmed");

    if (!compareHash(otp, user?.confirmEmailOTP?.code as string)) {
      throw new BadRequestException("Invalid OTP");
    }

    const createdAt = user?.confirmEmailOTP?.createdAt as Date;

    if (!createdAt) {
      throw new BadRequestException("OTP Not found");
    }

    if (
      Date.now() - createdAt.getTime() >
      Number(process.env.OTP_EXPIRATION_MS)
    ) {
      await this._userModel.updateOne({
        filter: { email },
        update: { $unset: { confirmEmailOTP: true } },
      });

      throw new BadRequestException("OTP has expired");
    }

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmedAt: new Date(),
        $unset: { confirmEmailOTP: true },
      },
    });

    return res.status(201).json({ message: "User confirmed successfully" });
  };

  resendConfirmEmail = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email }: IResendConfirmEmailDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
        confirmEmailOTP: { $exists: false },
      },
    });

    if (!user)
      throw new NotFoundException("user not found or email already confirmed");

    const otp = generateOtp();

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmEmailOTP: {
          code: await generateHash(otp.toString()),
          createdAt: new Date(
            Date.now() + Number(process.env.OTP_EXPIRATION_MS)
          ),
        },
      },
    });

    emailEvent.emit("confirmEmail", {
      to: email,
      username: user.username,
      otp,
    });
    return res
      .status(200)
      .json({ message: "OTP resent successfully please check your inbox" });
  };
}

export default new AuthenticationService();
// will export as a new instance
import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum RoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;

  email: string;
  confirmEmailOTP?: {
    code: string;
    createdAt: Date;
  };
  confirmedAt?: Date;

  changeCredentialsTime: Date;

  password: string;
  resetPasswordOTP?: string;
  profileImage?: string;
  coverImages: string[];

  phone?: string;
  address?: string;
  gender: GenderEnum;
  role: RoleEnum;

  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  sentRequests: Types.ObjectId[];

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 3, maxlength: 30 },
    lastName: { type: String, required: true, minlength: 3, maxlength: 30 },

    email: { type: String, required: true, unique: true },
    confirmEmailOTP: {
      code: String,
      createdAt: Date,
    },
    confirmedAt: Date,
    changeCredentialsTime: Date,
    password: { type: String, required: true },
    resetPasswordOTP: String,
    profileImage: String,
    coverImages: [String],

    phone: String,
    address: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = models.User || model("User", userSchema);

/**
 * Hydrated Document Type for IUser make your interface has all mongoose document methods
 *  and properties and virtuals and features
 */

export type UserDocument = HydratedDocument<IUser>;
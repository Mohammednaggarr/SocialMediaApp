import { Model, CreateOptions } from "mongoose";
import { IUser } from "../models/user.model";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../Utils/Response/error.response";

export class UserRepository extends DatabaseRepository<IUser> {
  constructor(protected override readonly model: Model<IUser>) {
    super(model);
  }

  async createUser({
    data = [],
    options = {},
  }: {
    data: Partial<IUser>[];
    options?: CreateOptions;
  }) {
    const [user] = (await this.create({ data, options })) || [];

    if (!user) throw new BadRequestException("Failed to create user");

    return user;
  }
}
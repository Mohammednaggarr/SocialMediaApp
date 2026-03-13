import { Model } from "mongoose";
import { IDirectMessage } from "../models/chat.model";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../Utils/Response/error.response";

export class DirectMessageRepository extends DatabaseRepository<IDirectMessage> {
  constructor(protected override readonly model: Model<IDirectMessage>) {
    super(model);
  }

  async createMessage({ data }: { data: Partial<IDirectMessage> }) {
    const [msg] = (await this.create({ data: [data] })) || [];
    if (!msg) throw new BadRequestException("Failed to send message");
    return msg;
  }
}

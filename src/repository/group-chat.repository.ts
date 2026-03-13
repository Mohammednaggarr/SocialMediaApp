import { Model } from "mongoose";
import { IGroupChat } from "../models/chat.model";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../Utils/Response/error.response";

export class GroupChatRepository extends DatabaseRepository<IGroupChat> {
  constructor(protected override readonly model: Model<IGroupChat>) {
    super(model);
  }

  async createGroup({ data }: { data: Partial<IGroupChat> }) {
    const [group] = (await this.create({ data: [data] })) || [];
    if (!group) throw new BadRequestException("Failed to create group chat");
    return group;
  }
}

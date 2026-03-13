import { Require_id, SortOrder, Types } from "mongoose";
import {
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  CreateOptions,
  HydratedDocument,
  Model,
  UpdateQuery,
  MongooseUpdateQueryOptions,
  DeepPartial,
  ApplyBasicCreateCasting,
} from "mongoose";

export abstract class DatabaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async create({
    data,
    options,
  }: {
    data: DeepPartial<ApplyBasicCreateCasting<Require_id<TDocument>>>[];
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TDocument>[] | undefined> {
    return await this.model.create(data, options);
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions | null;
  }) {
    const doc = this.model.findOne(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }

    return await doc.exec();
  }

  async find({
    filter,
    select,
    options,
    sort,
    skip,
    limit,
  }: {
    filter?: QueryFilter<TDocument>;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions | null;
    sort?: Record<string, SortOrder>;
    skip?: number;
    limit?: number;
  }) {
    const query = this.model.find(filter || {}).select(select || "");
    if (options?.populate) {
      query.populate(options.populate as PopulateOptions[]);
    }
    if (sort) query.sort(sort);
    if (skip !== undefined) query.skip(skip);
    if (limit !== undefined) query.limit(limit);
    return await query.exec();
  }

  async findById({
    id,
    select,
    options,
  }: {
    id: string | Types.ObjectId;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions | null;
  }) {
    const query = this.model.findById(id).select(select || "");
    if (options?.populate) {
      query.populate(options.populate as PopulateOptions[]);
    }
    return await query.exec();
  }

  async countDocuments(filter?: QueryFilter<TDocument>) {
    return await this.model.countDocuments(filter);
  }

  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: string | Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions | null;
  }) {
    return await this.model.findByIdAndUpdate(
      id,
      { ...update, $inc: { __v: 1 } },
      { new: true, ...options }
    );
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument> | null;
  }) {
    return await this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options
    );
  }
}
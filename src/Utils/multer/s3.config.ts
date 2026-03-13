import {
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"; // max file size 5MB
import { StorageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { createReadStream } from "fs";
import { BadRequestException } from "../Response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "public-read",
  path = "general",
  file,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: any;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
      file.originalname
    }`,
    Body:
      storageApproach === StorageEnum.MEMORY
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3Config().send(command);

  console.log(command.input.Key);

  if (!command?.input?.Key) throw new BadRequestException("File upload failed");

  return command.input.Key;
};

///! large file upload use multipart upload from aws sdk

export const uploadLargeFile = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "public-read",
  path = "general",
  file,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: any;
}) => {
  const upload = new Upload({
    client: s3Config(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
        file.originalname
      }`,
      Body:
        storageApproach === StorageEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024, // 500MB
  });

  upload.on("httpUploadProgress", (progress: any) => {
    console.log(progress);
  });

  const { Key } = await upload.done();
  if (!Key) throw new BadRequestException("File upload failed");

  return Key;
};

export const uploadFiles = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "public-read",
  path = "general",
  files,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: any[];
}) => {
  let urls: string[] = [];

  urls = await Promise.all(
    files.map((file) => {
      return uploadFile({
        storageApproach,
        Bucket,
        ACL,
        path,
        file,
      });
    })
  );

  // for (const file of files) {
  //   const key = await uploadFile({
  //     storageApproach,
  //     Bucket,
  //     ACL,
  //     path,
  //     file,
  //   });
  //   urls.push(key);
  // }

  return urls;
};

//presigned URL

export const createPresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ContentType,
  Originalname,
  expiresIn = 120,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  Originalname: string;
  expiresIn?: number;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${
      process.env.APPLICATION_NAME
    }/${path}/${uuid()}-presigned-${Originalname}`,
    ContentType,
  });

  const url = await getSignedUrl(s3Config(), command, { expiresIn });

  if (!url || !command?.input.Key)
    throw new BadRequestException("fail to generate presignedURL");

  return { url, Key: command.input.Key };
};

//! get asset
export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,

  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await s3Config().send(command);
};

export const createGetPresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
  downloadName = "dummy",
  download = "false",
  expiresIn = 120,
}: {
  Bucket?: string;
  Key: string;
  downloadName?: string;
  download?: string;
  expiresIn?: number;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition:
      download === "true" ? `attachment; filename=${downloadName}` : undefined,
  });

  const url = await getSignedUrl(s3Config(), command, { expiresIn });

  if (!url) {
    throw new BadRequestException("fail to generate presignedURL");
  }

  return url;
};
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../Response/error.response";

export const filleValidation = {
  images: ["image/jpg", "image/jpeg", "image/png", "image/gif"],
  videos: [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
  ],
  pdf: ["application/pdf"],
  docs: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export enum StorageEnum {
  MEMORY = "MEMORY",
  DISK = "DISK",
}

export const cloudFileUpload = ({
  validation = [],
  storageApproach = StorageEnum.MEMORY,
  maxFileSize = 2,
}: {
  validation?: string[];
  storageApproach?: StorageEnum;
  maxFileSize?: number;
}) => {
  const storage =
    storageApproach === StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (_req: Request, file: any, cb: any) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        });

  function fileFilter(
    _req: Request,
    file: any,
    cb: FileFilterCallback
  ) {
    if (!validation.includes(file.mimetype)) {
      cb(new BadRequestException("Invalid file type"));
    }

    return cb(null, true);
  }

  console.log(os.tmpdir());

  return multer({
    fileFilter,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
    storage,
  });
};
import express from "express";
import type { Express, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

config({ path: path.resolve("./.env") });

import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import postRouter from "./Modules/Post/post.controller";
import chatRouter from "./Modules/Chat/chat.controller";
import {
  BadRequestException,
  globalErrorHandler,
} from "./Utils/Response/error.response";
import connectDB from "./DB/connection";
import { createGetPresignedUrl, getFile } from "./Utils/multer/s3.config";
import { initializeSocket } from "./Utils/Socket/socket.service";

const createS3WriteStreamPipe = promisify(pipeline);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { status: 429, message: "Too many requests, please try again later." },
});

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;
  const httpServer = createServer(app);

  app.use(cors(), express.json(), helmet());
  app.use(limiter);

  await connectDB();

  initializeSocket(httpServer);

  app.get("/upload/*path", async (req: Request, res: Response) => {
    const { path } = req.params as unknown as { path: string[] };
    const { downloadName } = req.query;

    const Key = path.join("/");
    const s3Response = await getFile({ Key });
    if (!s3Response?.Body) throw new BadRequestException("fail to get");

    res.setHeader(
      "Content-Type",
      `${s3Response.ContentType}` || "application/octet-stream"
    );
    if (downloadName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${downloadName}`
      );
    }

    return await createS3WriteStreamPipe(
      s3Response.Body as NodeJS.ReadableStream,
      res
    );
  });

  app.get("/upload/pre-signed/*path", async (req: Request, res: Response) => {
    const { downloadName, download } = req.query as {
      download?: string;
      downloadName?: string;
    };

    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");

    const url = await createGetPresignedUrl({
      Key,
      downloadName: downloadName as string,
      download: download as string,
    });

    return res.status(200).json({ message: "done", url });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/post", postRouter);
  app.use("/api/v1/chat", chatRouter);

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "SocialBox API is running!" });
  });

  app.use("/*dummy", (_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use(globalErrorHandler);

  httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

export default bootstrap;
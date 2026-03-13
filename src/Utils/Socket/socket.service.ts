import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server | null = null;

interface SendMessagePayload {
  to: string;
  from: string;
  message: string;
}

interface SendGroupMessagePayload {
  groupId: string;
  sender: string;
  message: string;
}

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.MODE === "DEV" ? "*" : (process.env.ALLOWED_ORIGINS || "").split(","),
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    // Each user joins a personal room identified by their userId
    socket.on("join_room", (userId: string) => {
      socket.join(userId);
    });

    socket.on("send_message", (data: SendMessagePayload) => {
      io?.to(data.to).emit("receive_message", data);
    });

    socket.on("join_group", (groupId: string) => {
      socket.join(groupId);
    });

    socket.on("send_group_message", (data: SendGroupMessagePayload) => {
      io?.to(data.groupId).emit("receive_group_message", data);
    });

    socket.on("disconnect", () => {
      socket.rooms.forEach((room) => socket.leave(room));
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO has not been initialized");
  return io;
};

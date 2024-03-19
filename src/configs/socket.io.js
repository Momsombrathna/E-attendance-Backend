import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

if (io) {
  console.log("Socket.io server is running...");
} else {
  console.log("Socket.io server is not running");
}

export { io };

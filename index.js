import express from "express";
import userRouter from "./src/routes/user.js";
import authRouter from "./src/routes/auth.js";
import adminRouter from "./src/routes/admin.js";
import classRouter from "./src/routes/class.js";
import cardRouter from "./src/routes/card.js";
import attendanceRouter from "./src/routes/attendance.js";
import protectedRoute from "./src/middleware/authMiddleware.js";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "./src/middleware/verifyToken.js";

// Load environment variables
dotenv.config();

// Database
import("./src/db/database.js");

const app = express();
const port = process.env.PORT || 5176;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", authRouter);
app.use("/user", verifyToken, userRouter);
app.use("/admin", verifyToken, adminRouter);
app.use("/class", verifyToken, classRouter);
app.use("/card", verifyToken, cardRouter);
app.use("/attendance", verifyToken, attendanceRouter);

// Protected route
app.get("/protected", protectedRoute, (req, res) => {
  res.send("This is a protected route");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

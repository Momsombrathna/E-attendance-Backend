import express from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import classRouter from "./routes/class.js";
import cardRouter from "./routes/card.js";
import attendanceRouter from "./routes/attendance.js";
import protectedRoute from "./middleware/authMiddleware.js";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "./middleware/verifyToken.js";

// Load environment variables
dotenv.config();

// Database
import("./db/database.js");

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

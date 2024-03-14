import express from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import classRouter from "./routes/class.js";
import cardRouter from "./routes/card.js";
import protectedRoute from "./middleware/authMiddleware.js";
import dotenv from "dotenv";
import cors from "cors";

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
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/class", classRouter);
app.use("/card", cardRouter);

// Protected route
app.get("/protected", protectedRoute, (req, res) => {
  res.send("This is a protected route");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

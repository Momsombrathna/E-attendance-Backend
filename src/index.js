import express from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database
import("./db/database.js");

const app = express();
const port = process.env.PORT || 5176;

// Middleware
app.use(express.json());

// Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

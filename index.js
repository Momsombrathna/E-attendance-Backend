import express from "express";
import userRouter from "./src/routes/user.js";
import authRouter from "./src/routes/auth.js";

// Database
import("./src/db/database.js");

const app = express();
const port = 5176;

// Middleware
app.use(express.json());

// Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

import express from "express";
import models from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailOtp } from "../controller/auth/otp/requestEmailOtp.js";
import { requestResetPassOtp } from "../controller/auth/reset_password/resetPassOtp.js";
import { verifyOtp } from "../controller/auth/otp/verifyOtp.js";
import { verifyOtpResetPass } from "../controller/auth/reset_password/verifyOtp.js";
import { setNewPass } from "../controller/auth/reset_password/setNewPass.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const { userModel } = models;

// Register
router.post("/register", async (req, res) => {
  const user = new userModel({
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 10),
    email: req.body.email,
    role: req.body.role,
  });
  try {
    const savedUser = await user.save();

    await savedUser.save();

    res.status(201).send({
      message: `User ${user.username} has been registered successfully!`,
      user: savedUser,
    });
  } catch (error) {
    res.status(500).send(`Registration failed: ${error}`);
  }
});

// Login
router.post("/login", async (req, res) => {
  const user = await userModel.findOne({
    $or: [{ email: req.body.username }, { username: req.body.username }],
  });
  if (!user) return res.status(404).send("User not found 404!");

  if (!user.verified) {
    return res.status(400).send(`User ${user.username} has not been verified!`);
  }

  // compare the password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send(`Invalid password!`);
  } else {
    const token = jwt.sign({ _id: user._id }, "your-secret-key");

    user.tokens.push(token);
    await user.save();

    res.header("auth-token", token).send({
      message: `Welcome back, ${user.username}!`,
      user,
    });
  }
});

// Logout
router.post("/logout/:userId", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.userId });
    if (!user) {
      return res.status(404).send("User not found 404!");
    }
    if (user.verified === false) {
      return res
        .status(400)
        .send(`User ${user.username} has not been verified!`);
    }
    const token = req.header("auth-token");
    user.tokens = user.tokens.filter((t) => t !== token);
    await user.save();
    res.json({ message: `${user.username} has been logged out.` });
  } catch (error) {
    res.status(500).send(`Logout failed: ${error}`);
  }
});

// Send OTP
router.post("/email-otp", sendEmailOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Request OTP for reset password
router.post("/pass-reset-req-otp", requestResetPassOtp);

// Verify OTP for reset password
router.post("/verify-pass-reset-otp", verifyOtpResetPass);

// Set new password
router.post("/set-new-password", setNewPass);

export default router;

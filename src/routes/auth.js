import express from "express";
import models from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendEmailOtp } from "../controller/auth/otp/requestEmailOtp.js";
import { requestResetPassOtp } from "../controller/auth/otp/resetPassOtp.js";

const router = express.Router(); 

const { userModel, userOTPModel, passResetOTPModel } = models;

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
    const token = jwt.sign({ _id: savedUser._id }, "your-secret-key");
    res
      .status(201)
      .header("auth-token", token)
      .send({
        message: `User ${user.username} has been registered successfully!`,
        token,
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
    res.header("auth-token", token).send({
      message: `Welcome back, ${user.username}!`,
      token,
      user,
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  const user = await userModel.findOne({ username: req.body.username });

  // Check if user is verified
  if (!user.verified) {
    return res.status(400).send(`User ${user.username} has not been verified!`);
  }

  // Check if user is registered
  if (!user) {
    return res.status(404).send("User not found 404!");
  } else {
    res
      .header("auth-token", "")
      .send(`User ${user.username} has been logged out!`);
  }
});

// Send OTP
router.post("/email-otp", sendEmailOtp);

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Find OTP document for the user
  const userOTP = await userOTPModel.findOne({ email });

  if (!userOTP) {
    return res.status(404).send("OTP not found 404!");
  }

  // Check if OTP is valid
  if (userOTP.otp !== otp) {
    return res.status(400).send("Invalid OTP 400!");
  }

  // Check if OTP is expired
  const currentTime = new Date();
  const otpTime = userOTP.createdAt;
  const timeDiff = Math.abs(currentTime - otpTime);
  const minutes = Math.floor(timeDiff / 60000);
  if (minutes > 5) {
    return res.status(400).send("OTP expired 400!");
  }

  // If the OTP is match, complete the registration
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found 404!");
  } else {
    user.verified = true;
    await user.save();
    res.status(200).send({
      message: `User ${user.username} has been verified successfully!`,
    });
  }
});

// Request OTP for reset password
router.post("/pass-reset-req-otp", requestResetPassOtp);

// Verify OTP for reset password
router.post("/verify-pass-reset-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Find OTP document for the user
  const passResetOTP = await passResetOTPModel.findOne({ email });

  if (!passResetOTP) {
    return res.status(404).send("OTP not found 404!");
  }

  // Check if OTP is valid
  if (passResetOTP.otp !== otp) {
    return res.status(400).send("Invalid OTP 400!");
  }

  // Check if OTP is expired
  const currentTime = new Date();
  const otpTime = passResetOTP.createdAt;
  const timeDiff = Math.abs(currentTime - otpTime);
  const minutes = Math.floor(timeDiff / 60000);
  if (minutes > 5) {
    return res.status(400).send("OTP expired 400!");
  }

  // If the OTP is match, complete the registration
  const user = await passResetOTPModel.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found 404!");
  } else {
    user.reset_pass = true;
    await user.save();
    res.status(200).send({
      message: `User ${user.email} has been verified password reset successfully!`,
    });
  }
});

// Set new password
router.post("/set-new-password", async (req, res) => {
  const { email, password } = req.body;

  // Check if reset_pass true
  const verify_otp = await passResetOTPModel.findOne({
    reset_pass: true,
    email,
  });
  if (!verify_otp) {
    return res.status(404).send("Please request and verify OTP first!");
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found 404!");
  } else {
    user.password = await bcrypt.hash(password, 10);
    verify_otp.reset_pass = false;
    await user.save();
    res.status(200).send({
      message: `Password has been reset successfully!`,
    });
  }
});

export default router;

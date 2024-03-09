import express from "express";
import models from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";

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
router.post("/email-otp", async (req, res) => {
  const { email } = req.body;

  // Check if user is registered
  const users = await userModel.findOne({ email });

  if (!users) {
    return res.status(404).send("Email not found 404!");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = new userOTPModel({
    userId: users._id, // store reference to the user
    email: users.email,
    otp,
  });

  // Save OTP to the database
  try {
    const savedOTP = await user.save();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "OTP for Email Verification", // Subject line
      html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">E-attendance</a>
            </div>
            <p style="font-size:1.1em">Hi, ${users.username} !</p>
            <p>Thank you for choosing E-attendance. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />E-attendance</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>E-attendance</p>
              <p>Royal University of Phnom Penh</p>
              <p>Phnom Penh</p>
            </div>
          </div>
        </div>
      `, // plain text body
    });

    res.send({
      message: `OTP sent to ${email}`,
      messageId: info.messageId,
      savedOTP,
    });
  } catch (error) {
    res.status(500).send(`Sending OTP failed: ${error}`);
  }
});

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
router.post("/pass-reset-req-otp", async (req, res) => {
  const { email } = req.body;

  // Check if user is registered
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found 404!");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const passResetOTP = new passResetOTPModel({
    user: user._id,
    email: user.email,
    otp,
  });

  // Save OTP to the database
  try {
    const savedOTP = await passResetOTP.save();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "OTP for Password Reset", // Subject line
      html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">E-attendance</a>
            </div>
            <p style="font-size:1.1em">Hi, ${user.username} !</p>
            <p>Use the following OTP to reset your password. OTP is valid for 5 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />E-attendance</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>E-attendance</p>
              <p>Royal University of Phnom Penh</p>
              <p>Phnom Penh</p>
            </div>
          </div>
        </div>
      `, // plain text body
    });

    res.send({
      message: `OTP for reset password sent to ${email}`,
      messageId: info.messageId,
      savedOTP,
    });
  } catch (error) {
    res.status(500).send(`Sending OTP failed: ${error}`);
  }
});

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

router.get("/protected", auth, async (req, res) => {
  r;
  // This code will only be reached if the token is valid
  res.send("You have accessed a protected route!");
});

export default router;

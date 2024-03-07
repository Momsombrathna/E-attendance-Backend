import express from "express";
import models from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

const { userModel, userOTPModel } = models;

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
        message: `User "${user.username}" has been registered successfully!`,
        token,
        user: savedUser,
      });
  } catch (error) {
    res.status(500).send(`Registration failed: ${error}`);
  }
});

router.post("/login", async (req, res) => {
  const user = await userModel.findOne({ username: req.body.username });
  if (!user) return res.status(404).send("User not found 404!");

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
  if (!user) {
    return res.status(404).send("User not found 404!");
  } else {
    user.token = "";
    await user.save();
    res.status(200).send({
      message: `User ${user.username} has been logged out successfully!`,
    });
  }
});

// Register with phone number OTP
// router.post("/register/phone", async (req, res) => {
//   const { username, phoneNumber } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000);
//   const user = new userOTPModel({
//     username,
//     phoneNumber,
//     otp,
//   });
//   try {
//     const savedOTP = await user.save();
//     client.messages
//       .create({
//         body: `Your OTP is: ${otp}`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: `+${phoneNumber}`,
//       })
//       .then((message) => {
//         res.send({
//           message: `OTP sent to ${phoneNumber}`,
//           messageID: message.sid,
//         });
//       });
//   } catch (error) {
//     res.status(500).send(`Registration failed: ${error}`);
//   }
// });

// // Verify OTP
// router.post("/verify/phone", async (req, res) => {
//   const { phoneNumber, otp } = req.body;
//   const user = await userOTPModel.findOne({ phoneNumber, otp });
//   if (!user) return res.status(404).send("User not found 404!");
//   res.send({
//     message: `Phone number verified successfully!`,
//     user,
//   });
// });

router.get("/protected", auth, async (req, res) => {
  // This code will only be reached if the token is valid
  res.send("You have accessed a protected route!");
});

export default router;

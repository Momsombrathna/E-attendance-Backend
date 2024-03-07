import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    max: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    max: 8,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  token: {
    type: String,
    required: false,
  },
});

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const userModel = mongoose.model("User", userSchema);
const userOTPModel = mongoose.model("OTP", otpSchema);

export default { userModel, userOTPModel };

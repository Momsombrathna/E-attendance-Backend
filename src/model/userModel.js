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
  verified: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: String,
    default:
      "https://res.cloudinary.com/dugfn9ryq/image/upload/v1709959639/rjapwzgokwhog42nilql.jpg",
  },
  tokens: [
    {
      type: String,
      default: [],
    },
  ],
});

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  email: {
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
    expires: 120,
  },
});

const passResetOTPSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  reset_pass: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120,
  },
});

const userModel = mongoose.model("User", userSchema);
const userOTPModel = mongoose.model("email_otp", otpSchema);
const passResetOTPModel = mongoose.model("pass_reset_otp", passResetOTPSchema);

export default { userModel, userOTPModel, passResetOTPModel };

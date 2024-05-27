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
      "https://dl.dropboxusercontent.com/scl/fi/kmcuuyyb9i35tpee4euoj/blank-avatar-photo-place-holder-600nw-1095249842.png?rlkey=lp2ncl7o29yexj0opxn00eh7g&st=c15s5s98&dl=0",
  },
  tokens: [
    {
      type: String,
      default: [],
      expires: 1209600, // expire in 14 days
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

passResetOTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

const userModel = mongoose.model("User", userSchema);
const userOTPModel = mongoose.model("email_otp", otpSchema);
const passResetOTPModel = mongoose.model("pass_reset_otp", passResetOTPSchema);

export default { userModel, userOTPModel, passResetOTPModel };

import model from "../../../model/userModel.js";

const { passResetOTPModel } = model;

export const verifyOtpResetPass = async (req, res) => {
  const { email, otp } = req.body;

  // Find OTP document for the user
  const passResetOTP = await passResetOTPModel
    .findOne({ email })
    .sort({ createdAt: -1 });

  if (!passResetOTP) {
    return res.status(404).send({
      message: "OTP not found 404!",
    });
  }

  // Check if OTP is valid
  if (passResetOTP.otp !== otp) {
    return res.status(400).send({
      message: "Invalid OTP 400!",
    });
  }

  // Check if OTP is expired
  const currentTime = new Date();
  const otpTime = passResetOTP.createdAt;
  const timeDiff = Math.abs(currentTime - otpTime);
  const minutes = Math.floor(timeDiff / 60000);
  if (minutes > 2) {
    return res.status(400).send({
      message: "OTP expired 400!",
    });
  }

  // If the OTP is match, complete the registration
  const user = await passResetOTPModel.findOne({ email });
  if (!user) {
    return res.status(404).send({
      message: "User not found 404!",
    });
  } else {
    user.reset_pass = true;
    await user.save();
    res.status(200).send({
      message: `User ${user.email} has been verified password reset successfully!`,
    });
  }
};

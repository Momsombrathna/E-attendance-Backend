import model from "../../../model/userModel.js";

const { userModel, userOTPModel } = model;

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Find OTP document for the user
  const userOTP = await userOTPModel.findOne({ email }).sort({ createdAt: -1 });

  if (!userOTP) {
    return res.status(404).send({
      message: "OTP not found 404!",
    });
  }

  // Check if OTP is valid
  if (userOTP.otp !== otp) {
    return res.status(400).send({
      message: "Invalid OTP 400!",
    });
  }

  // Check if OTP is expired
  const currentTime = new Date();
  const otpTime = userOTP.createdAt;
  const timeDiff = Math.abs(currentTime - otpTime);
  const minutes = Math.floor(timeDiff / 60000);
  if (minutes > 2) {
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
};

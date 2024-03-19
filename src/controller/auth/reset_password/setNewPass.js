import bcrypt from "bcrypt";
import model from "../../../model/userModel.js";

const { passResetOTPModel, userModel } = model;

export const setNewPass = async (req, res) => {
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
};

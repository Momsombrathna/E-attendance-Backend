import nodemailer from "nodemailer";
import models from "../../../model/userModel.js";

const { userModel, passResetOTPModel } = models;

export const requestResetPassOtp = async (req, res) => {
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
            <div style="border-bottom:1px solid #eee; background: #464DAA">
            <a href="" style="font-size:1.4em;color: #ffffff;text-decoration:none;font-weight:600; padding-left: 10px;">E-attendance</a>
            </div>
            <img src="https://dl.dropboxusercontent.com/scl/fi/c4m0ewm83dzmc0umxz0ap/Component_5__3_-removebg-preview.png?rlkey=l5x36tylx3xd5ouq4duz52pdi&dl=0" 
            alt="e-attendance" style="display: block; margin: auto; width: 160px; height:160px">
            <p style="font-size:1.1em">Hi, ${user.username}</p>
            <p>Here is your OTP to reset password <span style="color: #ff3333">valid for 2 minutes only.</span> </p>
            <h2 style="margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px; font-size:48px; letter-spacing: 5px; color: #2F3791;text-decoration:none;font-weight:600">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />E-attendance</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>E-attendance</p>
            <p>Royal university of Phnom Penh</p>
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
    res.status(500).send({
      message: "Internal server error 500!",
      error,
    });
  }
};

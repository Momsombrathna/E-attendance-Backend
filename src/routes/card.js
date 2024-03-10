import express from "express";
import model from "../model/cardModel.js";
import QRCode from "qrcode";
import models from "../model/userModel.js";
import classListModel from "../model/classModel.js";
import bcrypt from "bcrypt";
import s3 from "../configs/aws_s3.js";
// import { createCanvas } from "canvas";
// import JsBarcode from "jsbarcode";

const router = express.Router();

const { studentCardModel } = model;
const { userModel } = models;
const { classModel } = classListModel;

// Create student card
router.post("/create-student-card/:userId", async (req, res) => {
  const user = await userModel.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const studentCard = await studentCardModel.findOne({ userId: user._id });
  if (studentCard) {
    return res.status(400).json({ message: "Student card already exists" });
  }
  const {
    firstName,
    lastName,
    age,
    dateOfBirth,
    address,
    phoneNumber,
    email,
    profile,
  } = req.body;

  const studentId = bcrypt.hashSync(user._id.toString(), 10);

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(studentId);

  // Remove the data URL prefix
  const base64Image = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, "");

  // Convert the base64 string to a buffer
  const buffer = Buffer.from(base64Image, "base64");

  //define params
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${firstName}_${lastName}_qr_code.png`,
    Body: buffer,
    ContentEncoding: "base64",
    ContentType: "image/png",
    ACL: "public-read",
  };

  //upload to s3
  s3.upload(params, async function (err, data) {
    if (err) {
      res.status(500).send({ message: err.message });
    }

    const qrCodeUrl = data.Location;

    const classList = await classModel.find({ students: user._id });

    const studentCard = new studentCardModel({
      userId: user._id,
      firstName,
      lastName,
      age,
      dateOfBirth,
      address,
      phoneNumber,
      email,
      classList: classList.map((c) => c._id),
      profile,
      // barcode: barcode,
      qrCode: qrCodeUrl,
    });
    try {
      const savedStudentCard = await studentCard.save();
      res.status(201).json(savedStudentCard);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  });
});

// Update student card
router.patch("/update-student-card/:userId", async (req, res) => {
  const user = await userModel.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const studentCard = await studentCardModel.findOne({ userId: user._id });
  if (!studentCard) {
    return res.status(404).json({ message: "Student card not found" });
  }
  const {
    firstName,
    lastName,
    age,
    dateOfBirth,
    address,
    phoneNumber,
    email,
    profile,
  } = req.body;

  try {
    const updatedStudentCard = await studentCardModel.findOneAndUpdate(
      { userId: user._id },
      {
        firstName,
        lastName,
        age,
        dateOfBirth,
        address,
        phoneNumber,
        email,
        profile,
      },
      { new: true }
    );
    res.send(updatedStudentCard);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

export default router;

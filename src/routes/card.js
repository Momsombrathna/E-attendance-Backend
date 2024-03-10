import express from "express";
import model from "../model/cardModel.js";
import QRCode from "qrcode";
import pkg from "barcode-generator";
import models from "../model/userModel.js";
import classListModel from "../model/classModel.js";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";

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

  try {
    // Generate QR code
    const qrCode = await QRCode.toDataURL(user._id.toString());

    // Generate barcode
    const canvas = createCanvas();

    const classList = await classModel.find({ students: user._id });

    // Initialize the barcode generator
    // JsBarcode(canvas, user._id.toString(), {
    //   format: "CODE128",
    //   displayValue: false,
    //   width: 2,
    //   height: 60,
    // });

    // Convert the canvas to a data URL
    // const barcode = canvas
    //   .toDataURL("image/png")
    //   .replace(/^data:image\/(png|jpg);base64,/, "");

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
      qrCode: qrCode,
    });

    const savedStudentCard = await studentCard.save();
    res.status(201).json(savedStudentCard);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
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

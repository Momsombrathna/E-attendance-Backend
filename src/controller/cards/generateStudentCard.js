import model from "../../model/cardModel.js";
import QRCode from "qrcode";
import models from "../../model/userModel.js";
import classListModel from "../../model/classModel.js";
import bcrypt from "bcrypt";
import s3Client from "../../configs/aws_s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fromBase64 } from "@aws-sdk/util-base64-node";

const { studentCardModel } = model;
const { userModel } = models;
const { classModel } = classListModel;

export const createStudentCard = async (req, res) => {
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

  // Generate student ID
  const studentId = bcrypt.hashSync(user._id.toString(), 10);

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(studentId);

  // Remove the data URL prefix
  const base64Image = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, "");

  // Convert the base64 string to a buffer
  const buffer = fromBase64(base64Image);

  // Define params
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${firstName}_${lastName}_qr_code.png`,
    Body: buffer,
    ContentType: "image/png",
    ACL: "public-read",
  };

  try {
    const uploadCommand = new PutObjectCommand(params);
    const data = await s3Client.send(uploadCommand);

    const qrCodeUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${firstName}_${lastName}_qr_code.png`;

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
      qrCode: qrCodeUrl,
    });

    const savedStudentCard = await studentCard.save();
    res.status(201).json(savedStudentCard);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

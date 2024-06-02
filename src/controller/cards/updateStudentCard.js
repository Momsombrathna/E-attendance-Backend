import model from "../../model/cardModel.js";
import models from "../../model/userModel.js";
import s3Client from "../../configs/aws_s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const { studentCardModel } = model;
const { userModel } = models;

export const editStudentCard = async (req, res) => {
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
    sex,
    dateOfBirth,
    address,
    phoneNumber,
    email,
    profile,
  } = req.body;

  const profileImage = req.file;
  if (!profileImage) {
    return res.status(400).json({ message: "Profile image is required" });
  }

  // Convert profile image to base64
  const base64Image = profileImage.buffer.toString("base64");

  // Convert the base64 string to a buffer
  const imageBuffer = Buffer.from(base64Image, "base64");

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME_2,
    Key: `${user._id}_profile_image.png`,
    Body: imageBuffer,
    ContentType: "image/png",
    ACL: "public-read",
  };

  try {
    const uploadCommand = new PutObjectCommand(params);
    const data = await s3Client.send(uploadCommand);

    const profileUrl = `https://${process.env.AWS_BUCKET_NAME_2}.s3.${process.env.AWS_REGION}.amazonaws.com/${user._id}_profile_image.png`;

    const updatedStudentCard = await studentCardModel.findOneAndUpdate(
      { userId: user._id },
      {
        firstName,
        lastName,
        age,
        sex,
        dateOfBirth,
        address,
        phoneNumber,
        email,
        profile: profileUrl,
      },
      { new: true }
    );
    res.send(updatedStudentCard);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

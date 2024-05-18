import express from "express";
import model from "../model/userModel.js";
import CardList from "../model/cardModel.js";
import classList from "../model/classModel.js";
import s3Client from "../configs/aws_s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

const router = express.Router();

const upload = multer();

const { userModel } = model;
const { studentCardModel } = CardList;
const { classModel } = classList;

// Get the user
router.get("/get/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the user from the database
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Send the user as a response
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get all users
router.get("/get", async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update the user
router.patch(
  "/update/:userId",
  upload.single("profileImage"),
  async (req, res) => {
    const { username } = req.body;
    const { userId } = req.params;
    const profileImage = req.file;

    if (!profileImage) {
      res.status(400).json({ message: "Profile image is required" });
    }

    const base64image = profileImage.buffer.toString("base64");

    const imageBuffer = Buffer.from(base64image, "base64");

    const params = {
      Bucket: process.env.AWS_BUCKET_PROFILE,
      Key: `${userId}_profile_image.png`,
      Body: imageBuffer,
      ContentType: "image/png",
      ACL: "public-read",
    };

    try {
      const uploadCommand = new PutObjectCommand(params);
      const data = await s3Client.send(uploadCommand);

      const profileUrl = `https://${process.env.AWS_BUCKET_PROFILE}.s3.${process.env.AWS_REGION}.amazonaws.com/${userId}_profile_image.png`;

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { username, profile: profileUrl },
        { new: true }
      );

      res.send(updatedUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete the user
router.delete("/delete/:userId", (req, res) => {
  res.send("Delete from database at id: " + req.params.id);
});

// get student card
router.get("/get-student-card/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const studentCard = await studentCardModel.findOne({ userId });

    if (!studentCard) {
      return res.status(404).json({ message: "Student card not found" });
    }

    res.send(studentCard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get class owner
router.get("/get-class-owner/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const classList = await classModel.find({ owner: userId });

    if (!classList) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.send(classList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get class students
router.get("/get-students-class/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const classList = await classModel.find({ "students.studentId": userId });

    if (!classList) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.send(classList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

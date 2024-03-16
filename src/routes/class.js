import express from "express";
import models from "../model/classModel.js";
import userModels from "../model/userModel.js";
import s3Client from "../configs/aws_s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { inviteToClass } from "../controller/class/inviteUserToClass.js";
import multer from "multer";

const router = express.Router();

const upload = multer();

const { classModel } = models;
const { userModel } = userModels;

// Create the class by user
router.post("/create-class/:userId", async (req, res) => {
  const { className, student, owner } = req.body;

  // Find the user
  const user = await userModel.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create a new class
  const newClass = new classModel({
    className,
    owner: user._id,
    students: [student],
    createdBy: user._id,
  });

  // Save the class
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Invite the user to the class
router.post("/invite-student/:classId", inviteToClass);

// Delete the class
router.delete("/delete-class/:classId", async (req, res) => {
  const { classId } = req.params;
  const { userId } = req.body;

  try {
    const classItem = await classModel.findById(classId);

    if (!classItem) {
      return res.status(404).send({ message: "Class not found" });
    }

    if (classItem.owner.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "You do not have permission to delete this class" });
    }

    await classModel.findByIdAndDelete(classId);

    res.send({ message: "Class has been deleted" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Kick the student from the class
router.delete("/kick-student/:classId", async (req, res) => {
  const { classId } = req.params;
  const { userId, studentId } = req.body;

  try {
    const classItem = await classModel.findById(classId);

    if (!classItem) {
      return res.status(404).send({ message: "Class not found" });
    }

    if (classItem.owner.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "You do not have permission to kick the student" });
    }

    classItem.students = classItem.students.filter(
      (student) => student.userId.toString() !== studentId
    );

    await classItem.save();

    res.send({ message: "Student has been kicked from the class" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Update the class
router.patch(
  "/update-class/:classId",
  upload.single("classImage"),
  async (req, res) => {
    const { classId } = req.params;
    const { className } = req.body;
    const classImage = req.file;

    if (!classImage) {
      return res.status(400).send({ message: "Please upload a class image" });
    }

    const base64Image = classImage.buffer.toString("base64");

    const buffer = Buffer.from(base64Image, "base64");

    // Define params
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME_3,
      Key: `${className}.png`,
      Body: buffer,
      ContentType: "image/png",
      ACL: "public-read",
    };

    try {
      const uploadCommand = new PutObjectCommand(params);
      const data = await s3Client.send(uploadCommand);

      const classProfileUrl = `https://${process.env.AWS_BUCKET_NAME_3}.s3.${process.env.AWS_REGION}.amazonaws.com/${className}.png`;

      const updatedClass = await classModel.findByIdAndUpdate(
        classId,
        { className, classProfile: classProfileUrl },
        { new: true }
      );

      res.send(updatedClass);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

export default router;

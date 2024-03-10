import express from "express";
import models from "../model/classModel.js";
import userModels from "../model/userModel.js";

const router = express.Router();

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
router.post("/invite-student/:classId", async (req, res) => {
  const { username } = req.body;

  try {
    // Find the class and the user
    const classroom = await classModel.findById(req.params.classId);
    const user = await userModel.findOne({ username });

    // Check if the user is already added to the class
    if (classroom.students.includes(user._id)) {
      return res.status(400).send("User already added to the class");
    }

    if (!classroom || !user) {
      return res.status(404).send("Class or User not found");
    }

    if (user.verified === false) {
      return res.status(400).send("User that has been invited is not verified");
    }

    // Add the user to the class's students array
    classroom.students.push(user._id);

    // Save the class
    await classroom.save();

    res.send(`${user.username} has been added to the class`);
  } catch (err) {
    res.status(500).send(err);
  }
});

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

// Update the class
router.patch("/update-class/:classId", async (req, res) => {
  const { classId } = req.params;
  const { className, classProfile } = req.body;

  try {
    const updatedClass = await classModel.findByIdAndUpdate(
      classId,
      { className, classProfile },
      { new: true }
    );

    res.send(updatedClass);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

export default router;

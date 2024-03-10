import express from "express";
import model from "../model/userModel.js";
import CardList from "../model/cardModel.js";
import classList from "../model/classModel.js";

const router = express.Router();

const { userModel } = model;
const { studentCardModel } = CardList;
const { classModel } = classList;

// Update the user
router.put("/update/:userId", async (req, res) => {
  const { username, profile } = req.body;

  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { username, profile },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.send(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete the user
router.delete("/delete/:userId", (req, res) => {
  res.send("Delete from database at id: " + req.params.id);
});

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
    const classList = await classModel.find({ students: userId });

    if (!classList) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.send(classList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

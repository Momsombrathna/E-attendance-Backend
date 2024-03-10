import express from "express";
import mongoose from "mongoose";
import model from "../model/classModel.js";

const router = express.Router();

const User = mongoose.model("User");
const { classModel } = model;

// Get all users from database
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// get all classes from database
router.get("/all-classes", async function (req, res) {
  try {
    const classes = await classModel.find();
    res.send(classes);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// Delete user from database
router.delete("/delete-user/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({
        message: `User with id ${req.params.id} not found!`,
      });
    }
    res.send({
      message: `User with id ${req.params.id} has been deleted!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// Delete class from database
router.delete("/delete-class/:classId", async (req, res) => {
  try {
    const classroom = await classModel.findByIdAndDelete(req.params.id);
    if (!classroom) {
      return res.status(404).send({
        message: `Class with id ${req.params.id} not found!`,
      });
    }
    res.send({
      message: `Class with id ${req.params.id} has been deleted!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

export default router;

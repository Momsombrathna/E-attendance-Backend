import express from "express";
import mongoose from "mongoose";
import model from "../model/classModel.js";
import models from "../model/cardModel.js";
import { deleteUser } from "../controller/admin/DeleteUser.js";
import { deleteClass } from "../controller/admin/DeleteClass.js";
import { getClassRoom } from "../controller/admin/getClass.js";

const router = express.Router();

const User = mongoose.model("User");
const { classModel } = model;
const { studentCardModel } = models;

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

// get all cards from database
router.get("/all-cards", async function (req, res) {
  try {
    const cards = await studentCardModel.find();
    res.send(cards);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// get class by id
router.get("/get-class/:classId", getClassRoom);

// Delete user from database
router.delete("/delete-user/:userId", deleteUser);

// Delete class from database
router.delete("/delete-class/:classId", deleteClass);

export default router;

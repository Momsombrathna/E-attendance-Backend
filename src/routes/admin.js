import express from "express";
import mongoose from "mongoose";
import model from "../model/classModel.js";
import models from "../model/cardModel.js";
import { deleteUser } from "../controller/admin/DeleteUser.js";
import { deleteClass } from "../controller/admin/DeleteClass.js";
import { adminVerifyToken } from "../middleware/adminVerifyToken.js";
import { getTimeLine } from "../controller/admin/GetTimeLine.js";
import { getUser } from "../controller/admin/GetUser.js";
import { userQuery } from "../controller/admin/SearchUser.js";
import { classQuery } from "../controller/admin/SearchClass.js";
import { updateUserRole } from "../controller/admin/ManageUserRole.js";
import { getAllClass } from "../controller/admin/GetAllClass.js";

const router = express.Router();

const User = mongoose.model("User");
const { classModel } = model;
const { studentCardModel } = models;

// Get all users from database
router.get("/all-users", adminVerifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users.reverse());
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// get user by id
router.get("/get-user/:userId", adminVerifyToken, getUser);

// get all classes from database
router.get("/all-classes", adminVerifyToken, async function (req, res) {
  try {
    const classes = await classModel.find();
    res.send(classes.reverse());
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

// get all cards from database
router.get("/all-cards", adminVerifyToken, async function (req, res) {
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
router.get("/get-class/:classId", adminVerifyToken, getAllClass);

// get timeline by class id
router.get("/get-timeline/:id", adminVerifyToken, getTimeLine);

// Delete user from database
router.delete("/delete-user/:userId", adminVerifyToken, deleteUser);

// Delete class from database
router.delete("/delete-class/:classId", adminVerifyToken, deleteClass);

// Search user by query
router.get("/search-user/:query", adminVerifyToken, userQuery);

// Search class by query
router.get("/search-class/:query", adminVerifyToken, classQuery);

// Update user role
router.put("/update-role/:adminId", adminVerifyToken, updateUserRole);

export default router;

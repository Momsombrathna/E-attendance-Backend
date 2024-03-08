import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const User = mongoose.model("User");

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

// Delete user from database
router.delete("/delete-user/:id", async (req, res) => {
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

export default router;

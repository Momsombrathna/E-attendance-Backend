import express from "express";
import model from "../model/userModel.js";

const router = express.Router();

const { userModel } = model;

// Update the user
router.put("/update/:id", async (req, res) => {
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

router.delete("/:id", (req, res) => {
  res.send("Delete from database at id: " + req.params.id);
});

export default router;

import models from "../../model/classModel.js";
import userModels from "../../model/userModel.js";

const { classModel } = models;
const { userModel } = userModels;

export const inviteUserByCode = async (req, res) => {
  const { userId } = req.params;
  const { code } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const classItem = await classModel.findOne({ code });
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classItem.students.includes(userId)) {
      return res.status(400).json({ message: "User already in the class" });
    }

    if (user._id.toString() === classItem.owner.toString()) {
      return res.status(400).json({ message: "Owner cannot join the class" });
    }

    classItem.students.push(userId);
    await classItem.save();

    res.status(200).json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

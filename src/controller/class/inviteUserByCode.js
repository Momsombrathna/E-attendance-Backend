import models from "../../model/classModel.js";
import userModels from "../../model/userModel.js";

const { classModel } = models;
const { userModel } = userModels;

export const inviteUserByCode = async (req, res) => {
  const { code, userId } = req.body;

  try {
    // Find the class by code
    const classItem = await classModel
      .findOne({ code })
      .populate("owner", "username")
      .populate("students.studentId", "username")
      .exec();
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already in the class
    const isUserInClass = classItem.students.find(
      (student) => student.studentId.toString() === userId
    );
    if (isUserInClass) {
      return res.status(400).json({ message: "User already in the class" });
    }

    // Add user to the class
    classItem.students.push({
      studentId: userId,
      studentName: user.username,
      studentProfile: user.profile,
    });

    await classItem.save();
    res.send(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

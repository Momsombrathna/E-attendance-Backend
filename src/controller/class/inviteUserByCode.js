import models from "../../model/classModel.js";
import userModels from "../../model/userModel.js";

const { classModel } = models;

export const inviteUserByCode = async (req, res) => {
  const { code } = req.body;
  const { userId } = req.params;

  try {
    const classItem = await classModel.findOne({ code });

    if (!classItem) {
      return res.status(404).send({ message: "Class not found" });
    }

    if (classItem.students.includes(userId)) {
      return res.status(400).send({ message: "User already in the class" });
    }

    classItem.students.push(userId);
    await classItem.save();

    res.status(200).json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

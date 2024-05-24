import model from "../../model/classModel.js";
import Models from "../../model/userModel.js";

const { classModel } = model;
const { userModel } = Models;

export const userLeaveClass = async (req, res) => {
  const { classId } = req.params;
  const { userId } = req.body;

  try {
    const classItem = await classModel.findById(classId);

    if (!classItem) {
      return res.status(404).send({ message: "Class not found" });
    }

    const studentId = classItem.students.find(
      (student) => student.studentId === userId
    );
    if (!studentId) {
      return res
        .status(400)
        .send({ message: "You are not a student of this class" });
    }

    // check class owner not allow to leave
    const user = await userModel.findById(userId);
    if (classItem.owner === user._id) {
      return res.status(400).send({ message: "Owner not allow to leave" });
    }

    classItem.students = classItem.students.filter(
      (student) => student.studentId !== userId
    );
    await classItem.save();

    res.status(200).json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

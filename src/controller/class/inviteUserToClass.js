import models from "../../model/classModel.js";
import userModels from "../../model/userModel.js";

const { classModel } = models;
const { userModel } = userModels;

export const inviteToClass = async (req, res) => {
  const { userId } = req.body;

  try {
    const classroom = await classModel.findById(req.params.classId);

    const user = await userModel.findOne({ _id: userId });

    if (!classroom) {
      return res.status(404).send({ message: "Class not found" });
    }

    if (classroom.students.includes(userId)) {
      return res.status(400).send({ message: "User already in the class" });
    }

    classroom.students.push({
      userId,
      profile: user.profile,
      userName: user.username,
    });

    await classroom.save();

    res.send({ message: "User has been invited to the class" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

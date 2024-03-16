import model from "../../model/classModel.js";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";

const { classModel } = model;
const { userModel } = models;
const { attendanceModel } = attendance;

export const createTimeLine = async (req, res) => {
  const { classId } = req.params;
  const { userId, description, latitude, longitude } = req.body;

  // Find the class
  const classroom = await classModel.findById(classId);
  if (!classroom) {
    return res.status(404).json({ message: "Class not found" });
  }

  // Find user
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Find students
  const studentList = await userModel.find({
    _id: { $in: classroom.students },
  });

  // check class owner
  if (classroom.owner.toString() !== userId) {
    return res.status(401).json({ message: "You are not the class owner" });
  } else {
    const newAttendance = new attendanceModel({
      classId: classId,
      userId,
      latitude,
      longitude,
      attendances: studentList.map((student) => {
        return {
          studentId: student._id,
          checkedIn: false,
          status: "absent",
        };
      }),
      description: description,
    });

    try {
      const savedAttendance = await newAttendance.save();
      res.json(savedAttendance);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

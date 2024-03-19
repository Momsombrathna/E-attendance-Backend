import model from "../../model/classModel.js";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";

const { classModel } = model;
const { userModel } = models;
const { attendanceModel } = attendance;

export const deleteTimeLine = async (req, res) => {
  const { attendanceId } = req.params;
  const { userId } = req.body;

  // Find the attendance
  const attendance = await attendanceModel.findById(attendanceId);
  if (!attendance) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  // Find user
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // check class owner
  const classroom = await classModel.findById(attendance.classId);
  if (classroom.owner.toString() !== userId) {
    return res.status(401).json({ message: "You are not the class owner" });
  } else {
    try {
      await attendanceModel.findByIdAndDelete(attendanceId);
      res.status(200).json({ message: "Time Line deleted" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

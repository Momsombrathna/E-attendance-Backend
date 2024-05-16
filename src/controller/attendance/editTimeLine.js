import model from "../../model/classModel.js";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";

const { classModel } = model;
const { userModel } = models;
const { attendanceModel } = attendance;

export const editTimeLine = async (req, res) => {
  const { attendanceId } = req.params;
  const { userId, description, from, to, latitude, longitude, location_range } =
    req.body;

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
  if (!classroom) {
    return res.status(404).json({ message: "Class not found" });
  }

  if (classroom.owner.toString() !== userId) {
    return res
      .status(401)
      .json({ message: "You are not the owner of this class" });
  }

  // const studentList = await classModel.findById(attendance.classId.toString());

  // Update the attendance
  const updatedAttendance = await attendanceModel.findByIdAndUpdate(
    attendanceId,
    {
      description,
      from,
      to,
      location_range,
      latitude,
      longitude,
    },
    { new: true }
  );

  if (!updatedAttendance) {
    return res.status(400).json({ message: "Failed to update the attendance" });
  }

  res.status(200).json(updatedAttendance);
};

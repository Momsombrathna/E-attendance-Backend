import model from "../../model/classModel.js";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";
import { checkedOut } from "./checkedOut.js";

const { classModel } = model;
const { userModel } = models;
const { attendanceModel } = attendance;

export const createTimeLine = async (req, res) => {
  const { classId } = req.params;
  const { userId, description, from, to, latitude, longitude } = req.body;

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

  // check class owner
  if (classroom.owner.toString() !== userId) {
    return res
      .status(403)
      .send({ message: "You do not have permission to create timeline" });
  }

  // Create a new attendance
  const newAttendance = new attendanceModel({
    classId,
    description,
    from,
    to,
    latitude,
    longitude,
    attendances: classroom.students
      .map((student) => {
        if (student) {
          return {
            studentId: student,
            checkedIn: false,
            checkedInTime: null,
            checkedOut: false,
            checkedOutTime: null,
            status: "absent",
          };
        }
      })
      .filter(Boolean),
  });

  // Save the attendance
  try {
    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

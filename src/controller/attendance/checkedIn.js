import model from "../../model/classModel.js";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";

const { classModel } = model;
const { userModel } = models;
const { attendanceModel } = attendance;

export const checkedIn = async (req, res) => {
  const { classId } = req.params;
  const { userId, studentId } = req.body;

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

  // Check if the user is the class owner
  if (classroom.owner.toString() !== userId) {
    return res.status(401).json({ message: "You are not the class owner" });
  } else {
    // Find the attendance
    const attendance = await attendanceModel.findOne({ classId: classId });
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    // Check if the student is already checked in
    const student = attendance.attendances.find(
      (student) => student.studentId.toString() === studentId
    );
    if (student) {
      return res.status(400).json({ message: "Student already checked in" });
    }

    // Check if the student is in the class
    if (!classroom.students.includes(studentId)) {
      return res
        .status(404)
        .json({ message: "Student not found in the class" });
    }

    // Check in the student
    const newStudent = {
      studentId: studentId,
      checkedIn: Date.now(),
      status: "present",
    };

    attendance.attendances.push(newStudent);

    try {
      const savedAttendance = await attendance.save();
      res.json(savedAttendance);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

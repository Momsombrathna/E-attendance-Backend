import model from "../../model/attendanceModel.js";
import models from "../../model/classModel.js";

const { attendanceModel } = model;
const { classModel } = models;

export const getAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const classDetails = await classModel.findOne({ _id: id });
    if (!classDetails) {
      return res.status(404).json({
        message: "Class not found",
      });
    }
    const attendance = await attendanceModel.find({ classId: id });
    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }
    return res.status(200).json({
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

import mongoose from "mongoose";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";
import getDistanceFromLatLonInKm from "../../utils/CalculateDistance.js";
import { io } from "../../configs/socket.io.js";

const { userModel } = models;
const { attendanceModel } = attendance;

export const checkedIn = async (req, res) => {
  const { attendanceId } = req.params;
  const { studentId, latitude, longitude } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the attendance
    const attendance = await attendanceModel
      .findById(attendanceId)
      .populate("classId")
      .session(session);
    if (!attendance) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Attendance not found" });
    }

    // Find user
    const user = await userModel.findById(studentId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is in the attendance list and if already checked in
    const student = attendance.attendances.find(
      (student) => student.studentId.toString() === studentId
    );
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        message: "you are not in the attendance list",
      });
    }

    if (student.checkedIn) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are already checked in" });
    }

    // Check if the current time is within the attendance time range 15 minutes before and after
    const currentTime = new Date();
    const from = new Date(attendance.from);
    const to = new Date(attendance.to);
    const fifteenMinutes = 15 * 60 * 1000;

    if (currentTime < from - fifteenMinutes) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Check in only available 15 minutes before the class starts",
      });
    }

    if (currentTime > to) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Class has ended" });
    }

    // Check if user is within the allowed location range
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      attendance.latitude,
      attendance.longitude
    );

    if (distance >= attendance.location_range) {
      const distanceStr =
        distance < 1
          ? `${(distance * 1000).toFixed(2)} meters`
          : `${distance.toFixed(2)} kilometers`;
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: `You are ${distanceStr} far from the class` });
    }

    // Update the attendance
    const updatedAttendance = await attendanceModel.findByIdAndUpdate(
      attendanceId,
      {
        $set: {
          "attendances.$[elem].checkedIn": true,
          "attendances.$[elem].checkedInTime": currentTime,
        },
      },
      {
        arrayFilters: [{ "elem.studentId": studentId }],
        new: true,
        session,
      }
    );

    if (!updatedAttendance) {
      throw new Error({
        message: "Failed to check in, please try again later",
      });
    }

    await session.commitTransaction();
    session.endSession();

    // Emit socket event
    io.emit("checkedIn", { username: user.username, time: currentTime });

    return res.status(200).send("Checked in successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

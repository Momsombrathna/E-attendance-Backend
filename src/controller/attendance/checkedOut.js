import mongoose from "mongoose";
import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";
import getDistanceFromLatLonInKm from "../../utils/CalculateDistance.js";
import { io } from "../../configs/socket.io.js";

const { userModel } = models;
const { attendanceModel } = attendance;

export const checkedOut = async (req, res) => {
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

    // Check if user is in the attendance list
    const student = attendance.attendances.find(
      (student) => student.studentId.toString() === studentId
    );
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        message:
          "New user cannot check out now, please wait for the next time.",
      });
    }

    // Check if user is already checked out
    if (student.checkedOut) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are already checked out" });
    }

    // Check if user is checked in
    if (!student.checkedIn) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are not checked in yet" });
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

    if (currentTime > to + fifteenMinutes) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Check in only available 15 minutes before the class ends",
      });
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

    // Check if 30 minutes have passed since the start of the attendance
    const thirtyMinutes = 30 * 60 * 1000;
    if (currentTime - from < thirtyMinutes) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "You can only check out 30 minutes after the start of the class starts",
      });
    }

    // Update the attendance
    const updatedAttendance = await attendanceModel.findByIdAndUpdate(
      attendanceId,
      {
        $set: {
          "attendances.$[elem].checkedOut": true,
          "attendances.$[elem].checkedOutTime": currentTime,
          "attendances.$[elem].status": "present",
        },
      },
      {
        arrayFilters: [{ "elem.studentId": studentId }],
        new: true,
        session,
      }
    );

    if (!updatedAttendance) {
      throw new Error("Failed to update attendance");
    }

    await session.commitTransaction();
    session.endSession();

    // Emit socket event
    io.emit("checkedOut", { username: user.username, time: currentTime });

    return res.status(200).json({ message: "Checked out successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

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
        message: "New user cannot check in now, please wait for the next time.",
      });
    }

    if (student.checkedIn) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are already checked in" });
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

    // Check if the current time is within the attendance time
    const currentTime = new Date();
    const from = new Date(attendance.from);
    const to = new Date(attendance.to);

    if (currentTime < from) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are too early" });
    }

    if (currentTime > to) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You are too late" });
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
      throw new Error("Failed to update attendance");
    }

    await session.commitTransaction();
    session.endSession();

    // Emit socket event
    io.emit("checkedIn", { username: user.username, time: currentTime });

    return res.status(200).json({ message: "Checked in successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";
import getDistanceFromLatLonInKm from "../../utils/CalculateDistance.js";
import { io } from "../../configs/socket.io.js";

const { userModel } = models;
const { attendanceModel } = attendance;

export const checkedIn = async (req, res) => {
  const { attendanceId } = req.params;
  const { studentId, latitude, longitude } = req.body;

  // Find the attendance
  const attendance = await attendanceModel
    .findById(attendanceId)
    .populate("classId");
  if (!attendance)
    return res.status(404).json({ message: "Attendance not found" });

  // Find user
  const user = await userModel.findById(studentId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Check if user is in the attendance and if already checked in
  const student = attendance.attendances.find(
    (student) => student.studentId.toString() === studentId
  );
  if (!student)
    return res
      .status(401)
      .json({ message: "You are not in the attendance list" });
  if (student.checkedIn === true)
    return res.status(400).json({ message: "You are already checked in" });

  // Check if user is in the location
  const distance = getDistanceFromLatLonInKm(
    latitude,
    longitude,
    attendance.latitude,
    attendance.longitude
  );

  // Check distance from database to that allowed to check in
  if (distance >= attendance.location_range) {
    let distanceStr = "";
    if (distance >= 10) {
      // Distance is in km
      distanceStr = `${distance.toFixed(2)} km`;
    } else if (distance < 1) {
      // Distance is in meter
      distanceStr = `${(distance * 1000).toFixed(2)} m`;
    } else {
      // Distance is in cm
      distanceStr = `${(distance * 100000).toFixed(2)} cm`;
    }
    return res
      .status(400)
      .json({ message: `You are ${distanceStr} far from the class` });
  }

  // Check if the time is within the attendance time
  const currentTime = new Date();
  const from = new Date(attendance.from);
  const to = new Date(attendance.to);

  if (currentTime < from)
    return res.status(400).json({ message: "You are too early" });
  if (currentTime > to)
    return res.status(400).json({ message: "You are too late" });

  // Check if 30 minutes have passed since the start of the attendance
  const thirtyMinutes = 30 * 60 * 1000;
  if (currentTime - from > thirtyMinutes)
    return res.status(400).json({ message: "You are too late" });

  // Update the attendance
  try {
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
      }
    );

    if (!updatedAttendance) throw new Error();

    // Emit socket
    io.emit("checkedIn", { username: user.username, time: currentTime });

    return res.status(200).json({ message: "Checked in successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import models from "../../model/userModel.js";
import attendance from "../../model/attendanceModel.js";
import getDistanceFromLatLonInKm from "../../utils/CalculateDistance.js";
import { io } from "../../configs/socket.io.js";

const { userModel } = models;
const { attendanceModel } = attendance;

export const checkedOut = async (req, res) => {
  const { attendanceId } = req.params;
  const { studentId, latitude, longitude } = req.body;

  // Find the attendance
  const attendance = await attendanceModel
    .findById(attendanceId)
    .populate("classId");
  if (!attendance) {
    res.status(404).json({ message: "Attendance not found" });
  }

  // Find user
  const user = await userModel.findById(studentId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }

  // Check if user is in the attendance
  const student_id = attendance.attendances.find(
    (student) => student.studentId.toString() === studentId
  );
  if (!student_id) {
    res.status(401).json({ message: "You are not in the attendance list" });
  }

  // check if user is already checked out
  const student = attendance.attendances.find(
    (student) => student.studentId.toString() === studentId
  );
  if (student.checkedOut) {
    res.status(400).json({ message: "You are already checked out" });
  }

  // check if user is already checked in
  if (!student.checkedIn) {
    res.status(400).json({ message: "You are not checked in yet" });
  }

  // check if user is in the location
  const distance = getDistanceFromLatLonInKm(
    latitude,
    longitude,
    attendance.latitude,
    attendance.longitude
  );

  // Check distance only 10m far from the location that allowed to check in
  if (distance >= 0.01) {
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

  // check if the time is within the attendance time
  const currentTime = new Date();
  const from = new Date(attendance.from);
  const to = new Date(attendance.to);
  // console.log(convertDate(currentTime));

  if (currentTime < from) {
    return res.status(400).json({ message: "You are too early" });
  }

  if (currentTime > to) {
    return res.status(400).json({ message: "You are too late" });
  }

  // Update the attendance
  try {
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
      }
    );

    if (!updatedAttendance) throw new Error();

    // Emit socket
    io.emit("checkedOut", { username: user.username, time: currentTime });

    res
      .status(200)
      .json({ message: `${user.username} been checked out at ${currentTime}` });
  } catch (error) {
    res.status(400).json({ message: "Failed to check out" });
  }
};

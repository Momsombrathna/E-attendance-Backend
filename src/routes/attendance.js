import express from "express";
import { createTimeLine } from "../controller/attendance/createTimeLine.js";
import { editTimeLine } from "../controller/attendance/editTimeLine.js";
import { deleteTimeLine } from "../controller/attendance/deleteTimeLine.js";
import { checkedIn } from "../controller/attendance/checkedIn.js";
import { checkedOut } from "../controller/attendance/checkedOut.js";
import { getAttendance } from "../controller/attendance/getAttendance.js";

const router = express.Router();

// Create timeline
router.post("/create-timeline/:classId", createTimeLine);

// Edit timeline
router.patch("/edit-timeline/:attendanceId", editTimeLine);

// Delete timeline
router.delete("/delete-timeline/:attendanceId", deleteTimeLine);

// Check in
router.post("/checked-in/:attendanceId", checkedIn);

// Check out
router.post("/checked-out/:attendanceId", checkedOut);

// Get attendance
router.get("/get-subclass/:id", getAttendance);

export default router;

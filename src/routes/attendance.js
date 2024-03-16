import express from "express";
import { createTimeLine } from "../controller/attendance/createTimeLine.js";

const router = express.Router();

// Create timeline
router.post("/create-timeline/:classId", createTimeLine);

export default router;

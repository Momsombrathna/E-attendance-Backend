import express from "express";
import { createStudentCard } from "../controller/cards/generateStudentCard.js";
import { editStudentCard } from "../controller/cards/updateStudentCard.js";
import multer from "multer";

const router = express.Router();

const upload = multer();

// Create student card
router.post("/create-student-card/:userId", createStudentCard);

// Update student card
router.put(
  "/update-student-card/:userId",
  upload.single("profileImage"),
  editStudentCard
);

export default router;

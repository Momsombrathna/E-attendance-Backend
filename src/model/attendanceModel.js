import mongoose from "../db/database";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true,
  },
  userId: [
    {
      type: String,
      data: {
        checkedIn: {
          type: Boolean,
          date: Date.now,
          required: true,
        },
        checkedOut: {
          type: Boolean,
          date: Date.now,
          required: true,
        },
      },
      required: false,
    },
  ],
  status: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  attendances: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class.students",
        required: true,
      },
      checkedIn: {
        type: Boolean,
        default: false,
      },
      checkedInTime: {
        type: Date,
      },
      checkedOut: {
        type: Boolean,
        default: false,
      },
      checkedOutTime: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["present", "absent"],
        default: "absent",
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const attendanceModel = mongoose.model("attendance", attendanceSchema);

export default { attendanceModel };

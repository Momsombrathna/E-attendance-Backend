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
        type: String,
        required: true,
      },
      profile: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      checkedIn: {
        type: Boolean,
        default: false,
      },
      checkedInTime: {
        type: Date,
        default: null,
      },
      checkedOut: {
        type: Boolean,
        default: false,
      },
      checkedOutTime: {
        type: Date,
        default: null,
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
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
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

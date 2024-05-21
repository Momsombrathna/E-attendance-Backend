import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ownerName: {
    type: String,
    required: true,
  },
  students: [
    {
      studentId: {
        type: String,
        required: true,
      },
      studentName: {
        type: String,
        required: true,
      },

      studentProfile: {
        type: String,
        required: true,
      },
      joined: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  classProfile: {
    type: String,
    default:
      "https://res.cloudinary.com/dugfn9ryq/image/upload/v1709975141/wzeirraamssqm47b3mmu.png",
  },
  code: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const classModel = mongoose.model("Class", classSchema);

export default { classModel };

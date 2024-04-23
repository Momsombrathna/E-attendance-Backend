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
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      profile: {
        type: String,
      },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      userName: {
        type: String,
      },
    },
  ],
  classProfile: {
    type: String,
    default:
      "https://res.cloudinary.com/dugfn9ryq/image/upload/v1709975141/wzeirraamssqm47b3mmu.png",
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const classModel = mongoose.model("Class", classSchema);

export default { classModel };

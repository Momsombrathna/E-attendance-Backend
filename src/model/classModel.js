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
      "https://dl.dropboxusercontent.com/scl/fi/ge2sl491yvwgv5xnj6km4/9176723.jpg?rlkey=1vsqekshlma82ghzabvbmkvnm&st=ttdxp6s3&dl=0",
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

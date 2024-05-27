import mongoose from "mongoose";

const studentCardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  classList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  profile: {
    type: String,
    default:
      "https://dl.dropboxusercontent.com/scl/fi/kmcuuyyb9i35tpee4euoj/blank-avatar-photo-place-holder-600nw-1095249842.png?rlkey=lp2ncl7o29yexj0opxn00eh7g&st=c15s5s98&dl=0",
  },
  // barcode: {
  //   type: String,
  //   required: false,
  // },
  qrCode: {
    type: String,
    required: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const studentCardModel = mongoose.model("Student_Card", studentCardSchema);

export default { studentCardModel };

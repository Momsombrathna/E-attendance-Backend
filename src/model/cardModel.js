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
      "https://dl.dropboxusercontent.com/scl/fi/o4tmtdkxzcw7x5qyzfm6r/blank-profile-picture-973460_1920.png?rlkey=q05pdrg3v742cvpcc2l0jnuah&st=azsn5cqm&dl=0",
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

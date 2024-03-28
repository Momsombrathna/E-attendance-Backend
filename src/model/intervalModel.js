import mongoose from "mongoose";

const intervalSchema = new mongoose.Schema({
  isRunning: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const intervalModels = mongoose.model("Interval", intervalSchema);

export default { intervalModels };

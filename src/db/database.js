import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://brathna:RO2ibMxugDDoqJlA@cluster0.djg5yxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

export default mongoose;

import model from "../../model/classModel.js";

const { classModel } = model;

export const GetClassRoom = async (req, res) => {
  const { classId } = req.params;

  try {
    const classRoom = await classModel.findOne({ _id: classId });
    if (!classRoom) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.send(classRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

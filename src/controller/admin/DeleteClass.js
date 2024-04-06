import model from "../../model/classModel.js";
import models from "../../model/attendanceModel.js";

const { classModel } = model;
const { attendanceModel } = models;

export const deleteClass = async (req, res) => {
  const classId = req.params.classId;
  try {
    const classroom = await classModel.findByIdAndDelete(classId);
    if (!classroom) {
      return res.status(404).send({
        message: `Class with id ${classId} not found!`,
      });
    }

    await attendanceModel.deleteMany({ classId: classId });

    res.send({
      message: `Class ${classroom.className} has been deleted!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

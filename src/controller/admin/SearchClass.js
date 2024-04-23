import model from "../../model/classModel.js";

const { classModel } = model;

export const classQuery = async (req, res) => {
  const { query } = req.params;

  try {
    const regexQuery = new RegExp(query, "i");

    const classes = await classModel.find({
      $or: [
        { className: regexQuery },
        { ownerName: regexQuery },
        { students: { $in: [regexQuery] } },
      ].filter(Boolean),
    });

    res.send(classes);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

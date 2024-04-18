import model from "../../model/userModel.js";
import moment from "moment";

const { userModel } = model;

export const userQuery = async (req, res) => {
  const { query } = req.params;

  try {
    const date = moment(query, "YY/MM/DD HH:mm:ss").toDate();
    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const users = await userModel.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { role: { $regex: query, $options: "i" } },
        {
          verified:
            query.toLowerCase() === "verified"
              ? true
              : query.toLowerCase() === "not-verified"
              ? false
              : null,
        },
        { createdAt: { $gte: startDate, $lte: endDate } },
      ].filter(Boolean),
    });

    res.send(users);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

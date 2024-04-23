import model from "../../model/userModel.js";

const { userModel } = model;

export const userQuery = async (req, res) => {
  const { query } = req.params;

  try {
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
      ].filter(Boolean),
    });

    res.send(users);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

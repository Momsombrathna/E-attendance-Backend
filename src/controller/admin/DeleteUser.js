import model from "../../model/userModel.js";

const { userModel } = model;

export const deleteUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send({
        message: `User with id ${userId} not found!`,
      });
    }
    res.send({
      message: `User ${user.username} has been deleted!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

import model from "../../model/userModel.js";

const { userModel } = model;
export const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

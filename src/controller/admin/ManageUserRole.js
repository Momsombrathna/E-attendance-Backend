import model from "../../model/userModel.js";

const { userModel } = model;

export const updateUserRole = async (req, res) => {
  const { adminId } = req.params;
  const { role, userId } = req.body;

  const admin = await userModel.findOne({ _id: adminId });
  if (!admin) {
    return res.status(404).json({ message: "This action allow admin only!" });
  }

  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

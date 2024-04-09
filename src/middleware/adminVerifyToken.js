import jwt from "jsonwebtoken";
import model from "../model/userModel.js";

const { userModel } = model;

export const adminVerifyToken = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .json({ error: "Access denied! token not found in header." });

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const user = await userModel.findById(decoded._id);
    if (!user.tokens.includes(token))
      return res.status(401).json({ error: "Invalid token" });

    // Check if the user is admin and
    if (user.role !== "admin")
      return res
        .status(401)
        .json({ error: "Access denied! Only admin can access this route." });

    req.userId = decoded._id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

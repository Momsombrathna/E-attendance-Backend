import jwt from "jsonwebtoken";
import model from "../model/userModel.js";

const { userModel } = model;

export const verifyToken = async (req, res, next) => {
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

    req.userId = decoded._id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

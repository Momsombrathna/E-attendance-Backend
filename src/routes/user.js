import express from "express";
import userModel from "../model/userModel.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send({
    data: [
      {
        id: 1,
        name: "John Doe",
        age: 21,
      },
      {
        id: 2,
        name: "Jane Doe",
        age: 22,
      },
    ],
  });
});

router.get("/:id", (req, res) => {
  res.send("This user id: " + req.params.id);
});

router.post("/", (req, res) => {
  res.send("This is post request");
});

router.patch("/:id", (req, res) => {
  res.send("This is id from server: " + req.params.id);
});

router.delete("/:id", (req, res) => {
  res.send("Delete from database at id: " + req.params.id);
});

export default router;

import express from "express";
import Model from "../model/intervalModel.js";

const router = express.Router();

const { intervalModels } = Model;

// create a new interval
router.post("/create-interval", async (req, res) => {
  const newInterval = new intervalModels({
    interval: req.body.interval,
  });

  try {
    const savedInterval = await newInterval.save();
    res.status(201).json(savedInterval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// run the interval
router.post("/start-interval/:intervalId", async (req, res) => {
  const { intervalId } = req.params;

  try {
    const interval = await intervalModels.findById(intervalId);

    if (!interval) {
      return res.status(404).send({ message: "Interval not found" });
    }

    // Start the interval
    const saveInterval = new intervalModels({
      isRunning: true,
    });

    await saveInterval.save();

    res.status(200).json(saveInterval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// stop the interval
router.post("/stop-interval/:intervalId", async (req, res) => {
  const { intervalId } = req.params;

  try {
    const interval = await intervalModels.findById(intervalId);

    if (!interval) {
      return res.status(404).send({ message: "Interval not found" });
    }

    // Stop the interval
    interval.isRunning = false;
    await interval.save();

    res.status(200).json(interval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

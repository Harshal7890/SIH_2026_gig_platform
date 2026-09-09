import { Worker } from "../models/worker.model.js";
import { Cooperative } from "../models/cooperative.model.js";
import { registerUser, loginUser } from "../services/user.service.js";

const registerWorker = async (req, res) => {
  const {
    email,
    password,
    name,
    mobileNumber,
    cooperativeId,
    skills,
    experience,
    certifications,
    address,
  } = req.body;

  const user = await registerUser(
    email,
    password,
    name,
    mobileNumber,
    "worker"
  );

  const worker = await Worker.create({
    userId: user._id,
    cooperativeId,
    skills,
    experience,
    certifications,
    address,
  });

  res.status(201).json({
    message: "Worker registered successfully",
    worker,
  });
};

const loginWorker = async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

const listWorkers = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const workers = await Worker.find({
    cooperativeId: cooperative._id,
  }).populate("userId", "name email mobileNumber");

  res.status(200).json({
    success: true,
    workers,
  });
};

export { registerWorker, loginWorker, listWorkers };

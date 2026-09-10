import { Worker } from "../models/worker.model.js";
import { Cooperative } from "../models/cooperative.model.js";
import { User } from "../models/user.model.js";
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

const updateWorker = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOne({
    _id: req.params.id,
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  const allowedFields = [
    "skills",
    "experience",
    "certifications",
    "address",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      worker[field] = req.body[field];
    }
  });

  await worker.save();

  res.status(200).json({
    success: true,
    message: "Worker updated successfully",
    worker,
  });
};

const deleteWorker = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOneAndDelete({
    _id: req.params.id,
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  await User.findByIdAndDelete(worker.userId);

  res.status(200).json({
    success: true,
    message: "Worker deleted successfully",
  });
};

const verifyWorker = async (req, res) => {
  const { status } = req.body;

  if (!status || !["pending", "verified", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification status. Must be: pending, verified, or rejected",
    });
  }

  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOne({
    _id: req.params.id,
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  worker.verification = status;
  await worker.save();

  res.status(200).json({
    success: true,
    message: `Worker verification status updated to '${status}'`,
    worker,
  });
};
const registerWorkerByCooperative = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const {
    email,
    password,
    name,
    mobileNumber,
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
    cooperativeId: cooperative._id,
    skills,
    experience,
    certifications,
    address,
    verification: "verified",
  });

  res.status(201).json({
    success: true,
    message: "Worker registered and verified successfully",
    worker,
  });
};

export {
  registerWorker,
  loginWorker,
  listWorkers,
  updateWorker,
  deleteWorker,
  verifyWorker,
  registerWorkerByCooperative,
};

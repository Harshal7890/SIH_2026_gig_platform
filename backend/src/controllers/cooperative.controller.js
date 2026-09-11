import { registerUser, loginUser } from "../services/user.service.js";
import { Cooperative } from "../models/cooperative.model.js";

const registerCooperative = async (req, res) => {
  const { email, password, name, mobileNumber, registrationNumber, address } =
    req.body;

  const user = await registerUser(
    email,
    password,
    name,
    mobileNumber,
    "cooperative"
  );

  const cooperative = await Cooperative.create({
    userId: user._id,
    name,
    registrationNumber,
    address,
  });

  res.status(201).json({
    message: "Cooperative registered successfully",
    cooperative,
  });
};

const loginCooperative = async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

const listCooperatives = async (req, res) => {
  const cooperatives = await Cooperative.find().populate(
    "userId",
    "name email mobileNumber"
  );

  res.status(200).json({
    success: true,
    cooperatives,
  });
};

const getCooperativeProfile = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  }).populate("userId", "name email mobileNumber roles");

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  res.status(200).json({
    success: true,
    cooperative,
  });
};

const updateCooperativeProfile = async (req, res) => {
  const { name, registrationNumber, address } = req.body;

  const cooperative = await Cooperative.findOneAndUpdate(
    { userId: req.user._id },
    { name, registrationNumber, address },
    { new: true }
  ).populate("userId", "name email mobileNumber roles");

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Cooperative profile updated successfully",
    cooperative,
  });
};

export {
  registerCooperative,
  loginCooperative,
  listCooperatives,
  getCooperativeProfile,
  updateCooperativeProfile,
};


import { Service } from "../models/service.model.js";
import ExpressError from "../utils/ExpressError.js";

const createService = async (req, res) => {
  const { name, category, description, basePrice } = req.body;

  const service = await Service.create({
    name,
    category,
    description,
    basePrice,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    service,
  });
};

const getAllServices = async (req, res) => {
  const services = await Service.find();

  res.status(200).json({
    success: true,
    services,
  });
};

const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ExpressError("Service not found", 404);
  }

  res.status(200).json({
    success: true,
    service,
  });
};

const deleteService = async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    throw new ExpressError("Service not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
};

export { createService, getAllServices, getServiceById, deleteService };

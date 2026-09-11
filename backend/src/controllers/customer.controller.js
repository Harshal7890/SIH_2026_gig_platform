import { Customer } from "../models/customer.model.js";
import { registerUser, loginUser } from "../services/user.service.js";

const registerCustomer = async (req, res) => {
  const { email, password, name, mobileNumber, address, location } = req.body;

  const user = await registerUser(
    email,
    password,
    name,
    mobileNumber,
    "customer"
  );

  const customer = await Customer.create({
    userId: user._id,
    address,
    location,
  });

  res.status(201).json({
    message: "Customer registered successfully",
    customer,
  });
};

const loginCustomer = async (req, res) => {
  const { email, mobileNumber, password } = req.body;
  const identifier = email || mobileNumber;

  const user = await loginUser(identifier, password);

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

export { registerCustomer, loginCustomer };

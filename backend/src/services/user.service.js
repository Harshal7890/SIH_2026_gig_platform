import { User } from "../models/user.model.js";
import ExpressError from "../utils/ExpressError.js";

const registerUser = async (email, password, name, mobileNumber, role) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    email,
    password,
    name,
    mobileNumber,
    roles: [role],
  });

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ExpressError("Invalid email or password", 401);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ExpressError("Invalid email or password", 401);
  }

  return user;
};

export { registerUser, loginUser };

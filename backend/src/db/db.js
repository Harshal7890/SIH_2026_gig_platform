import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  const connection = await mongoose.connect(
    `${process.env.MONGODB_URI}/${DB_NAME}`
  );

  console.log(`INFO MongoDB connected, DB HOST: ${connection.connection.host}`);
};

export default connectDB;

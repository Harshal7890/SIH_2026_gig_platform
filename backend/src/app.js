import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/error", (_req, _res) => {
  throw new ExpressError("ERROR", 500);
});

app.use(errorMiddleware);

export { app };

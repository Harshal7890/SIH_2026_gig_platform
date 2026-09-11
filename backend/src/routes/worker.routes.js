import { Router } from "express";
import {
  listWorkers,
  loginWorker,
  registerWorker,
  updateWorkerStatus,
} from "../controllers/worker.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateUser, requireRole("cooperative"), listWorkers);
router.patch("/:id/status", authenticateUser, requireRole("cooperative"), updateWorkerStatus);
router.route("/register").post(registerWorker);
router.route("/login").post(loginWorker);

export default router;

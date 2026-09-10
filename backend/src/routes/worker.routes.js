import { Router } from "express";
import {
  listWorkers,
  loginWorker,
  registerWorker,
  updateWorker,
  deleteWorker,
  verifyWorker,
} from "../controllers/worker.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateUser, requireRole("cooperative"), listWorkers);
router.route("/register").post(registerWorker);
router.route("/login").post(loginWorker);
router
  .route("/:id")
  .put(authenticateUser, requireRole("cooperative"), updateWorker)
  .delete(authenticateUser, requireRole("cooperative"), deleteWorker);
router
  .route("/:id/verify")
  .patch(authenticateUser, requireRole("cooperative"), verifyWorker);

export default router;

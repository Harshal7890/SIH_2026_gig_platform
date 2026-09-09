import { Router } from "express";
import {
  listWorkers,
  loginWorker,
  registerWorker,
} from "../controllers/worker.controller.js";

const router = Router();

router.route("/").get(listWorkers);
router.route("/register").post(registerWorker);
router.route("/login").post(loginWorker);

export default router;

import { Router } from "express";
import {
  loginCooperative,
  registerCooperative,
} from "../controllers/cooperative.controller.js";

const router = Router();

router.route("/register").post(registerCooperative);
router.route("/login").post(loginCooperative);

export default router;

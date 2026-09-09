import { Router } from "express";
import {
  listCooperatives,
  loginCooperative,
  registerCooperative,
} from "../controllers/cooperative.controller.js";

const router = Router();

router.route("/").get(listCooperatives);
router.route("/register").post(registerCooperative);
router.route("/login").post(loginCooperative);

export default router;

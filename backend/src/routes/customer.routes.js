import { Router } from "express";
import {
  loginCustomer,
  registerCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.route("/register").post(registerCustomer);
router.route("/login").post(loginCustomer);

export default router;

import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  deleteService,
} from "../controllers/service.controller.js";

const router = Router();

router.route("/").get(getAllServices).post(createService);
router.route("/:id").get(getServiceById).delete(deleteService);

export default router;

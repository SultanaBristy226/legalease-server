import express from "express";
import {
  createLawyerProfile,
  getAllLawyers,
  getLawyerById,
} from "../controllers/lawyerController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllLawyers);
router.get("/:id", getLawyerById);
router.post("/", verifyToken, verifyRole("lawyer"), createLawyerProfile);

export default router;
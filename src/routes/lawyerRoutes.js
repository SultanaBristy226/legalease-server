import express from "express";
import {
  createLawyerProfile,
  getAllLawyers,
  getLawyerById,
  getMyLawyerProfile,
  updateLawyerProfile,
  deleteLawyerProfile,
} from "../controllers/lawyerController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllLawyers);
router.get("/my-profile", verifyToken, verifyRole("lawyer"), getMyLawyerProfile);
router.get("/:id", getLawyerById);
router.post("/", verifyToken, verifyRole("lawyer"), createLawyerProfile);
router.patch("/:id", verifyToken, verifyRole("lawyer"), updateLawyerProfile);
router.delete("/:id", verifyToken, verifyRole("lawyer"), deleteLawyerProfile);

export default router;
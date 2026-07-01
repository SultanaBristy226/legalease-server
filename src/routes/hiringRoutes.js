import express from "express";
import {
  createHiringRequest,
  getMyHiringRequests,
  getReceivedHiringRequests,
  updateHiringStatus,
  payHiringFee,
} from "../controllers/hiringController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("user"), createHiringRequest);
router.get("/my-requests", verifyToken, verifyRole("user"), getMyHiringRequests);
router.get("/received", verifyToken, verifyRole("lawyer"), getReceivedHiringRequests);
router.patch("/:id/status", verifyToken, verifyRole("lawyer"), updateHiringStatus);
router.patch("/:id/pay", verifyToken, verifyRole("user"), payHiringFee);

export default router;
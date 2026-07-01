import express from "express";
import { getAnalytics } from "../controllers/adminController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/analytics", verifyToken, verifyRole("admin"), getAnalytics);

export default router;
import express from "express";
import { getAllTransactions } from "../controllers/transactionController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, verifyRole("admin"), getAllTransactions);

export default router;
import express from "express";
import { createPaymentIntent, confirmPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);
router.post("/confirm-payment", verifyToken, confirmPayment);

export default router;
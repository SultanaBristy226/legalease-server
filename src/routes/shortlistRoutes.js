import express from "express";
import {
  toggleShortlist,
  getMyShortlist,
  checkShortlist,
} from "../controllers/shortlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/toggle", verifyToken, toggleShortlist);
router.get("/my-shortlist", verifyToken, getMyShortlist);
router.get("/check/:lawyerId", verifyToken, checkShortlist);

export default router;
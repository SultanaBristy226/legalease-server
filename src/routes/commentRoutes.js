import express from "express";
import {
  createComment,
  getCommentsByLawyer,
  getMyComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (no token required)
router.get("/lawyer/:id", getCommentsByLawyer);

// Private routes (token + user role required)
router.post("/", verifyToken, verifyRole("user"), createComment);
router.get("/my-comments", verifyToken, verifyRole("user"), getMyComments);
router.patch("/:id", verifyToken, verifyRole("user"), updateComment);
router.delete("/:id", verifyToken, verifyRole("user"), deleteComment);

export default router;
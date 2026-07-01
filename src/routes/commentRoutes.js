import express from "express";
import {
  createComment,
  getCommentsByLawyer,
  getMyComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createComment);
router.get("/lawyer/:lawyerId", getCommentsByLawyer); // public
router.get("/my-comments", verifyToken, getMyComments);
router.put("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;
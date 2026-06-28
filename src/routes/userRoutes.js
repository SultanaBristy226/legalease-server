import express from "express";
import {
  updateProfile,
  getAllUsers,
  changeUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch("/update-profile", verifyToken, updateProfile);
router.get("/", verifyToken, verifyRole("admin"), getAllUsers);
router.patch("/:id/role", verifyToken, verifyRole("admin"), changeUserRole);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteUser);

export default router;
import User from "../models/User.js";
import HiringRequest from "../models/HiringRequest.js";
import Comment from "../models/Comment.js";
import Transaction from "../models/Transaction.js";

export const updateProfile = async (req, res) => {
  try {
    const { fullName, photoURL } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fullName) user.fullName = fullName;
    if (photoURL !== undefined) user.photoURL = photoURL;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "lawyer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully.", user });
  } catch (error) {
    console.error("Change role error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// ============================================================
// ========== NEW: Get User Stats ==========
// ============================================================
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count total hires (accepted + paid)
    const totalHires = await HiringRequest.countDocuments({
      client: userId,
      status: "accepted",
      isPaid: true,
    });

    // Count total comments
    const totalComments = await Comment.countDocuments({
      user: userId,
    });

    // Calculate average rating from comments
    const comments = await Comment.find({ user: userId });
    let averageRating = 0;
    if (comments.length > 0) {
      const totalRating = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
      averageRating = parseFloat((totalRating / comments.length).toFixed(1));
    }

    // Calculate total spent
    const transactions = await Transaction.find({ user: userId });
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      totalHires,
      totalComments,
      averageRating,
      totalSpent,
    });
  } catch (error) {
    console.error("Get user stats error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
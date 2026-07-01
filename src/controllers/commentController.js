import Comment from "../models/Comment.js";
import HiringRequest from "../models/HiringRequest.js";

// @desc   Create comment — only if user has hired and paid this lawyer
// @route  POST /api/comments
// @access Private (user only)
export const createComment = async (req, res) => {
  try {
    const { lawyerId, text } = req.body;
    const userId = req.user._id;

    // Check if all fields are provided
    if (!lawyerId || !text) {
      return res.status(400).json({ 
        message: "Lawyer ID and text are required." 
      });
    }

    // Check if user has hired and paid this lawyer
    const hasHired = await HiringRequest.findOne({
      client: userId,
      lawyer: lawyerId,
      status: "accepted",
      isPaid: true,
    });

    if (!hasHired) {
      return res.status(403).json({
        message: "You can only comment on lawyers you have hired and paid.",
      });
    }

    // Create comment
    const comment = await Comment.create({
      user: userId,
      lawyer: lawyerId,
      text,
    });

    // Populate user info
    const populated = await comment.populate("user", "fullName photoURL");

    res.status(201).json({ 
      message: "Comment posted successfully.", 
      comment: populated 
    });
  } catch (error) {
    console.error("Create comment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all comments for a lawyer (public)
// @route  GET /api/comments/lawyer/:id
// @access Public
export const getCommentsByLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ lawyer: id })
      .populate("user", "fullName photoURL")
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Get comments error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get logged-in user's own comments
// @route  GET /api/comments/my-comments
// @access Private (user only)
export const getMyComments = async (req, res) => {
  try {
    const userId = req.user._id;
    const comments = await Comment.find({ user: userId })
      .populate("lawyer", "name specialization photo")
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Get my comments error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update own comment
// @route  PATCH /api/comments/:id
// @access Private (user only)
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text || comment.text;
    await comment.save();

    res.status(200).json({ message: "Comment updated.", comment });
  } catch (error) {
    console.error("Update comment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete own comment
// @route  DELETE /api/comments/:id
// @access Private (user only)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
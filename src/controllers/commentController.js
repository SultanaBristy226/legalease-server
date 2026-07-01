import Comment from "../models/Comment.js";
import HiringRequest from "../models/HiringRequest.js";
// Create comment — only if user has hired this lawyer
export const createComment = async (req, res) => {
  try {
    const { lawyerId, text, rating } = req.body;
    const userId = req.user._id;

    const hasHired = await HiringRequest.findOne({
      client: userId,        
      lawyer: lawyerId,
    });

    if (!hasHired) {
      return res.status(403).json({
        message: "You must hire this lawyer before commenting",
      });
    }

    const comment = await Comment.create({
      user: userId,
      lawyer: lawyerId,
      text,
      rating,
    });

    const populated = await comment.populate("user", "name profilePicture");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments for a lawyer (public)
export const getCommentsByLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const comments = await Comment.find({ lawyer: lawyerId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's own comments
export const getMyComments = async (req, res) => {
  try {
    const userId = req.user._id;
    const comments = await Comment.find({ user: userId })
      .populate("lawyer", "name image specialization")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update own comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, rating } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text || comment.text;
    comment.rating = rating || comment.rating;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete own comment
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

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import Shortlist from "../models/Shortlist.js";

// Toggle shortlist (add/remove)
export const toggleShortlist = async (req, res) => {
  try {
    const { lawyerId } = req.body;
    const userId = req.user._id;

    if (!lawyerId) {
      return res.status(400).json({ message: "Lawyer ID is required." });
    }

    // Check if already shortlisted
    const existing = await Shortlist.findOne({ user: userId, lawyer: lawyerId });

    if (existing) {
      // Remove from shortlist
      await Shortlist.findByIdAndDelete(existing._id);
      return res.status(200).json({ 
        message: "Removed from shortlist", 
        shortlisted: false 
      });
    } else {
      // Add to shortlist
      await Shortlist.create({ user: userId, lawyer: lawyerId });
      return res.status(200).json({ 
        message: "Added to shortlist", 
        shortlisted: true 
      });
    }
  } catch (error) {
    console.error("Toggle shortlist error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// Get user's shortlist
export const getMyShortlist = async (req, res) => {
  try {
    const shortlist = await Shortlist.find({ user: req.user._id })
      .populate("lawyer", "name photo specialization hourlyRate status")
      .sort({ createdAt: -1 });

    res.status(200).json({ shortlist });
  } catch (error) {
    console.error("Get shortlist error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// Check if lawyer is shortlisted by current user
export const checkShortlist = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const userId = req.user._id;

    const exists = await Shortlist.findOne({ user: userId, lawyer: lawyerId });
    res.status(200).json({ shortlisted: !!exists });
  } catch (error) {
    console.error("Check shortlist error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
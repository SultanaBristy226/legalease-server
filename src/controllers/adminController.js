import User from "../models/User.js";
import Lawyer from "../models/Lawyer.js";
import HiringRequest from "../models/HiringRequest.js";
import Transaction from "../models/Transaction.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLawyers = await Lawyer.countDocuments({ isPublished: true });
    const totalHires = await HiringRequest.countDocuments({ status: "accepted" });

    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      totalUsers,
      totalLawyers,
      totalHires,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get analytics error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
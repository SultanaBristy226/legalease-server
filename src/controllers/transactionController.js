import Transaction from "../models/Transaction.js";

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "fullName email")
      .populate("lawyer", "name")
      .populate("hiringRequest")
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get all transactions error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
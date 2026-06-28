import HiringRequest from "../models/HiringRequest.js";
import Lawyer from "../models/Lawyer.js";

// @desc   Create a hiring request (client hires a lawyer)
// @route  POST /api/hiring
// @access Private (user only)
export const createHiringRequest = async (req, res) => {
  try {
    const { lawyerId } = req.body;

    if (!lawyerId) {
      return res.status(400).json({ message: "Lawyer ID is required." });
    }

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found." });
    }

    const existingRequest = await HiringRequest.findOne({
      client: req.user._id,
      lawyer: lawyerId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "You already have an active hiring request with this lawyer.",
      });
    }

    const hiringRequest = await HiringRequest.create({
      client: req.user._id,
      lawyer: lawyerId,
      fee: lawyer.hourlyRate,
    });

    res.status(201).json({ message: "Hiring request sent.", hiringRequest });
  } catch (error) {
    console.error("Create hiring request error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Get hiring history for logged-in user (client)
// @route  GET /api/hiring/my-requests
// @access Private (user only)
export const getMyHiringRequests = async (req, res) => {
  try {
    const requests = await HiringRequest.find({ client: req.user._id })
      .populate("lawyer", "name specialization photo")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get my hiring requests error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Get hiring requests received by the logged-in lawyer
// @route  GET /api/hiring/received
// @access Private (lawyer only)
export const getReceivedHiringRequests = async (req, res) => {
  try {
    const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
    if (!lawyerProfile) {
      return res.status(404).json({ message: "Lawyer profile not found." });
    }

    const requests = await HiringRequest.find({ lawyer: lawyerProfile._id })
      .populate("client", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get received hiring requests error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Accept or reject a hiring request (lawyer action)
// @route  PATCH /api/hiring/:id/status
// @access Private (lawyer only)
export const updateHiringStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const hiringRequest = await HiringRequest.findById(req.params.id);
    if (!hiringRequest) {
      return res.status(404).json({ message: "Hiring request not found." });
    }

    const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
    if (!lawyerProfile || String(hiringRequest.lawyer) !== String(lawyerProfile._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    hiringRequest.status = status;
    await hiringRequest.save();

    if (status === "accepted") {
      lawyerProfile.totalHires += 1;
      await lawyerProfile.save();
    }

    res.status(200).json({ message: `Request ${status}.`, hiringRequest });
  } catch (error) {
    console.error("Update hiring status error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
import HiringRequest from "../models/HiringRequest.js";
import Lawyer from "../models/Lawyer.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

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

    // Get client details
    const client = await User.findById(req.user._id);

    // Send email notification to lawyer
    const template = emailTemplates.hiringRequest(client.fullName, lawyer.name);
    sendEmail(
      lawyer.user?.email || "lawyer@example.com",
      template.subject,
      template.body,
      { clientName: client.fullName, lawyerName: lawyer.name }
    );

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

    // Get client details
    const client = await User.findById(hiringRequest.client);

    if (status === "accepted") {
      lawyerProfile.totalHires += 1;
      await lawyerProfile.save();

      // Send email notification to client
      const template = emailTemplates.hiringAccepted(client.fullName, lawyerProfile.name);
      sendEmail(
        client.email,
        template.subject,
        template.body,
        { clientName: client.fullName, lawyerName: lawyerProfile.name }
      );
    } else if (status === "rejected") {
      // Send email notification to client
      const template = emailTemplates.hiringRejected(client.fullName, lawyerProfile.name);
      sendEmail(
        client.email,
        template.subject,
        template.body,
        { clientName: client.fullName, lawyerName: lawyerProfile.name }
      );
    }

    res.status(200).json({ message: `Request ${status}.`, hiringRequest });
  } catch (error) {
    console.error("Update hiring status error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Mark a hiring request as paid and create transaction
// @route  PATCH /api/hiring/:id/pay
// @access Private (user only)
export const payHiringFee = async (req, res) => {
  try {
    const hiringRequest = await HiringRequest.findById(req.params.id);
    if (!hiringRequest) {
      return res.status(404).json({ message: "Hiring request not found." });
    }

    if (String(hiringRequest.client) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (hiringRequest.status !== "accepted") {
      return res.status(400).json({ message: "This request has not been accepted yet." });
    }

    if (hiringRequest.isPaid) {
      return res.status(400).json({ message: "Already paid." });
    }

    // Get lawyer info for transaction
    const lawyerProfile = await Lawyer.findById(hiringRequest.lawyer);
    if (!lawyerProfile) {
      return res.status(404).json({ message: "Lawyer profile not found." });
    }

    // Mark as paid
    hiringRequest.isPaid = true;
    hiringRequest.transactionId = `TXN-${Date.now()}`;
    await hiringRequest.save();

    // Create transaction record
    await Transaction.create({
      transactionId: hiringRequest.transactionId,
      user: req.user._id,
      lawyer: hiringRequest.lawyer,
      hiringRequest: hiringRequest._id,
      amount: hiringRequest.fee,
    });

    // Get client details
    const client = await User.findById(req.user._id);

    // Send email notification to client
    const template = emailTemplates.paymentSuccess(
      client.fullName,
      lawyerProfile.name,
      hiringRequest.fee
    );
    sendEmail(
      client.email,
      template.subject,
      template.body,
      { clientName: client.fullName, lawyerName: lawyerProfile.name, amount: hiringRequest.fee }
    );

    res.status(200).json({
      message: "Payment successful.",
      hiringRequest,
      transactionId: hiringRequest.transactionId
    });
  } catch (error) {
    console.error("Pay hiring fee error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
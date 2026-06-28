import Lawyer from "../models/Lawyer.js";

// @desc   Create a lawyer profile (for the logged-in lawyer)
// @route  POST /api/lawyers
// @access Private (lawyer only)
export const createLawyerProfile = async (req, res) => {
  try {
    const { name, photo, specialization, bio, hourlyRate } = req.body;

    if (!name || !photo || !specialization || !bio || !hourlyRate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingProfile = await Lawyer.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(409).json({ message: "You already have a lawyer profile." });
    }

    const lawyer = await Lawyer.create({
      user: req.user._id,
      name,
      photo,
      specialization,
      bio,
      hourlyRate,
      isPublished: true,
    });

    res.status(201).json({ message: "Lawyer profile created.", lawyer });
  } catch (error) {
    console.error("Create lawyer error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Get all published lawyers (with search, filter, pagination)
// @route  GET /api/lawyers
// @access Public
export const getAllLawyers = async (req, res) => {
  try {
    const { search, specialization, minFee, maxFee, status, page = 1, limit = 8 } = req.query;

    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (status) {
      query.status = status;
    }

    if (minFee || maxFee) {
      query.hourlyRate = {};
      if (minFee) query.hourlyRate.$gte = Number(minFee);
      if (maxFee) query.hourlyRate.$lte = Number(maxFee);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Lawyer.countDocuments(query);
    const lawyers = await Lawyer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      lawyers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Get lawyers error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

// @desc   Get a single lawyer by ID
// @route  GET /api/lawyers/:id
// @access Public
export const getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found." });
    }
    res.status(200).json({ lawyer });
  } catch (error) {
    console.error("Get lawyer error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
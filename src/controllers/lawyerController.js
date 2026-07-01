import Lawyer from "../models/Lawyer.js";

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

export const getMyLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ user: req.user._id });
    if (!lawyer) {
      return res.status(404).json({ message: "No lawyer profile found." });
    }
    res.status(200).json({ lawyer });
  } catch (error) {
    console.error("Get my lawyer profile error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

export const updateLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer profile not found." });
    }

    if (String(lawyer.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { name, photo, specialization, bio, hourlyRate, status } = req.body;

    if (name) lawyer.name = name;
    if (photo) lawyer.photo = photo;
    if (specialization) lawyer.specialization = specialization;
    if (bio) lawyer.bio = bio;
    if (hourlyRate) lawyer.hourlyRate = hourlyRate;
    if (status) lawyer.status = status;

    await lawyer.save();

    res.status(200).json({ message: "Profile updated.", lawyer });
  } catch (error) {
    console.error("Update lawyer profile error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};

export const deleteLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer profile not found." });
    }

    if (String(lawyer.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    await Lawyer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Profile deleted." });
  } catch (error) {
    console.error("Delete lawyer profile error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
};
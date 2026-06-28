// @desc   Get the logged-in lawyer's own profile
// @route  GET /api/lawyers/my-profile
// @access Private (lawyer only)
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

// @desc   Update the logged-in lawyer's own profile
// @route  PATCH /api/lawyers/:id
// @access Private (lawyer only, owner only)
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

// @desc   Delete the logged-in lawyer's own profile
// @route  DELETE /api/lawyers/:id
// @access Private (lawyer only, owner only)
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
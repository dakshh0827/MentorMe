import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");

    res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Validate the mentor ID format
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }

    // Find the mentor profile with only relevant fields
    const mentorProfile = await User.findOne({ _id: mentorId, role: "mentor" }).select(
      "name email profilePic phone address college semester program experience skills linkedin github resume ratings familyAnnualIncome interests examMastery createdAt updatedAt"
    );

    if (!mentorProfile) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    // Return the mentor profile
    return res.status(200).json(mentorProfile);
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMenteeProfile = async (req, res) => {
  try {
    const { menteeId } = req.params;

    // Validate the mentor ID format
    if (!mongoose.Types.ObjectId.isValid(menteeId)) {
      return res.status(400).json({ message: "Invalid mentee ID format" });
    }

    // Find the mentor profile with only relevant fields
    const menteeProfile = await User.findOne({ _id: menteeId, role: "mentee" }).select(
      "name email profilePic phone address school class subject"
    );

    if (!menteeProfile) {
      return res.status(404).json({ message: "Mentee profile not found" });
    }

    // Return the mentor profile
    return res.status(200).json(menteeProfile);
  } catch (error) {
    console.error("Error fetching mentee profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

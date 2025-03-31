import User from "../models/user.model.js";

export const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");

    res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

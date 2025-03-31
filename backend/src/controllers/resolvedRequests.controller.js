import mongoose from "mongoose";
import Request from "../models/requests.model.js";

// Get all pending requests for a mentor
export const getMentorRequests = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const requests = await Request.find({ to: mentorId, status: "pending" })
      .populate("from", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
    console.log("req....", requests);
  } catch (error) {
    console.error("Error fetching mentor requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getResolvedRequests = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID" });
    }

    const resolvedRequests = await Request.find({
      to: mentorId,
      status: { $in: ["accepted", "rejected"] },
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ resolvedAt: -1 });

    // Handle empty results
    if (resolvedRequests.length === 0) {
      return res.status(200).json({ message: "No resolved requests found", requests: [] });
    }

    res.status(200).json(resolvedRequests);
  } catch (error) {
    console.error("Error fetching resolved requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept a request
export const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const request = await Request.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    request.status = "accepted";
    request.resolvedAt = new Date();
    await request.save();

    const populatedRequest = await Request.findById(requestId)
      .populate("from", "name email")
      .populate("to", "name email");

    res.status(200).json(populatedRequest);
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Failed to accept request" });
  }
};

// Reject a request
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const request = await Request.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    request.status = "rejected";
    request.resolvedAt = new Date();
    await request.save();

    const populatedRequest = await Request.findById(requestId)
      .populate("from", "name email")
      .populate("to", "name email");

    res.status(200).json(populatedRequest);
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

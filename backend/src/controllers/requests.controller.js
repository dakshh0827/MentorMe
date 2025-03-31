import Request from "../models/requests.model.js";
import { io } from "../index.js";
import mongoose from 'mongoose';

export const sendRequest = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { from, to } = req.body;

        // Input Validation
        if (!from || !to) {
            return res.status(400).json({ message: "Missing required fields: from, to" });
        }
        if (from === to) {
            return res.status(400).json({ message: "You cannot send a request to yourself" });
        }

        // Check for Existing Pending Request
        const existingRequest = await Request.findOne({ from, to, status: "pending" });
        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Create and Save the New Request
        const newRequest = await Request.create({ from, to });

        // Emit Socket Event to Mentor
        io.to(to).emit("newRequest", newRequest);

        // Send Successful Response
        res.status(201).json({ message: "Request sent successfully", request: newRequest });
        console.log("sent");

    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const respondToRequest = async (req, res) => {
    try {
        console.log("Request response received:", req.body);
        const { status } = req.body;
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("from", "name");
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        io.to(request.from._id.toString()).emit("requestUpdated", request);
        res.json({ message: `Request ${status}`, request });
    } catch (error) {
        console.error("Error responding to request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRequestsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find all requests where the user is the sender, regardless of status
        const requests = await Request.find({ from: userId })
            .populate("to", "name email");  // Populate recipient details

        res.json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
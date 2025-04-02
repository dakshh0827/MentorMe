import Message from '../models/message.model.js';
import mongoose from 'mongoose';
import User from "../models/user.model.js";

export const getUserById = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, recipientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profilePicture')
    .populate('recipient', 'name profilePicture');

    if (req.user && req.user._id.toString() === userId) {
      await Message.updateMany(
        { sender: recipientId, recipient: userId, read: false },
        { $set: { read: true } }
      );
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;

    if (!sender || !recipient || !content) {
      return res.status(400).json({ message: "Sender, recipient, and content are required" });
    }

    const newMessage = new Message({ sender, recipient, content, read: false });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark a message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message marked as read", success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread messages count for a specific conversation
export const getUnreadCount = async (req, res) => {
  try {
    const { userId, recipientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const count = await Message.countDocuments({
      sender: recipientId,
      recipient: userId,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all recent conversations for a user
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: mongoose.Types.ObjectId(userId) }, { recipient: mongoose.Types.ObjectId(userId) }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$recipient", mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          role: "$user.role",
          profilePicture: "$user.profilePicture",
          lastMessage: "$lastMessage.content",
          lastMessageTime: "$lastMessage.createdAt",
          unreadCount: 1
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

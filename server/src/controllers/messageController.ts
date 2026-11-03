
import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Send a message in a conversation
export const createMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { content } = req.body ?? {};

    // Validate conversation ID
    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

    // Validate message content
    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Message content is required",
      });
      return;
    }

    if (content.trim().length > 5000) {
      res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
      return;
    }

    // Verify that the conversation belongs to the logged-in user
    const conversation = await Conversation.findOne({
      _id: id,
      user: req.user!.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    // Prevent messages in resolved or closed conversations
    if (
      conversation.status === "resolved" ||
      conversation.status === "closed"
    ) {
      res.status(400).json({
        success: false,
        message:
          "This conversation is no longer accepting messages",
      });
      return;
    }

    // Create the customer's message
    const message = await Message.create({
      conversation: id,
      sender: "customer",
      content: content.trim(),
    });

    // Update the conversation's latest activity time
    await Conversation.updateOne(
      { _id: id, user: req.user!.id },
      { $set: { lastMessageAt: new Date() } }
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: unknown) {
    console.error("Create message error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send message",
    });
  }
};

// Get all messages in a conversation
export const getConversationMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    // Validate conversation ID
    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

    // Verify conversation ownership
    const conversation = await Conversation.findOne({
      _id: id,
      user: req.user!.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    // Return messages from oldest to newest
    const messages = await Message.find({
      conversation: id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error: unknown) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch messages",
    });
  }
};

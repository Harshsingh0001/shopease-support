
import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";

export const createConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { subject } = req.body ?? {};

    if (typeof subject !== "string" || subject.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: "Subject must be at least 3 characters long",
      });
      return;
    }

    if (subject.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Subject cannot exceed 150 characters",
      });
      return;
    }

    const conversation = await Conversation.create({
      user: req.user!.id,
      subject: subject.trim(),
      status: "open",
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error: unknown) {
    console.error("Create conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create conversation",
    });
  }
};

export const getMyConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      user: req.user!.id,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error: unknown) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch conversations",
    });
  }
};


export const getConversationById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

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

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error: unknown) {
    console.error("Get conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch conversation",
    });
  }
};


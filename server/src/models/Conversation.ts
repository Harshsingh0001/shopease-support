
import mongoose, { Schema } from "mongoose";

export type ConversationStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export interface IConversation {
  user: mongoose.Types.ObjectId;
  subject: string;
  status: ConversationStatus;
  lastMessageAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Conversation subject is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;

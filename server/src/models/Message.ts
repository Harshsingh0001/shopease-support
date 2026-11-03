import mongoose, { Schema, type Document } from "mongoose";

export type MessageSenderRole = "customer" | "agent" | "admin" | "ai" | "system";
export type MessageVisibility = "customer" | "internal_note";

export interface IMessage extends Document {
  ticketId?: mongoose.Types.ObjectId;
  conversation?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  senderRole: MessageSenderRole;
  sender?: MessageSenderRole;
  body: string;
  content?: string;
  visibility: MessageVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["customer", "agent", "admin", "ai", "system"],
      default: "customer",
    },
    sender: {
      type: String,
      enum: ["customer", "agent", "admin", "ai", "system"],
    },
    body: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    visibility: {
      type: String,
      enum: ["customer", "internal_note"],
      default: "customer",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre("validate", function () {
  if (!this.body && this.content) {
    this.body = this.content;
  }
  if (!this.content && this.body) {
    this.content = this.body;
  }
  if (!this.senderRole && this.sender) {
    this.senderRole = this.sender;
  }
  if (!this.sender && this.senderRole) {
    this.sender = this.senderRole;
  }
});

messageSchema.index({ ticketId: 1, visibility: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;

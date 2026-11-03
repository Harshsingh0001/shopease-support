
import mongoose, { Schema, type Document } from "mongoose";

export type MessageSender = "customer" | "ai" | "admin";

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: MessageSender;
  content: string;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["customer", "ai", "admin"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;

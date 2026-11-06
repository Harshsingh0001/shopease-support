import mongoose, { Schema, type Document, type Types } from "mongoose";

export type CallStatus = "inbound" | "in_progress" | "completed" | "transferred" | "failed";
export type SpeakerType = "customer" | "ai" | "agent" | "system";
export type CallLanguage = "en" | "hi" | "hinglish";

export interface ITranscriptEntry {
  speaker: SpeakerType;
  text: string;
  timestamp: Date;
}

export interface ICallLog extends Document {
  callSid: string;
  callerNumber: string;
  callerName?: string;
  customerId?: Types.ObjectId;
  callStatus: CallStatus;
  duration: number; // in seconds
  recordingUrl?: string;
  language: CallLanguage;
  transcript: ITranscriptEntry[];
  ticketId?: Types.ObjectId;
  escalatedToAgent: boolean;
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transcriptEntrySchema = new Schema<ITranscriptEntry>(
  {
    speaker: {
      type: String,
      enum: ["customer", "ai", "agent", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const callLogSchema = new Schema<ICallLog>(
  {
    callSid: {
      type: String,
      required: [true, "Call SID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    callerNumber: {
      type: String,
      required: [true, "Caller number is required"],
      trim: true,
      index: true,
    },
    callerName: {
      type: String,
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    callStatus: {
      type: String,
      enum: ["inbound", "in_progress", "completed", "transferred", "failed"],
      default: "inbound",
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "hinglish"],
      default: "en",
    },
    transcript: [transcriptEntrySchema],
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      index: true,
    },
    escalatedToAgent: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying recent calls by caller
callLogSchema.index({ callerNumber: 1, createdAt: -1 });

const CallLog = mongoose.model<ICallLog>("CallLog", callLogSchema);

export default CallLog;

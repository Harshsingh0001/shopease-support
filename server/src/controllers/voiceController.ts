import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import CallLog, { type ICallLog } from "../models/CallLog.js";
import User from "../models/User.js";
import { processCustomerQuery } from "../modules/ai/aiService.js";
import { AppError } from "../utils/AppError.js";

const DEFAULT_SUPPORT_NUMBER = "+918001234567";

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const getVoiceLanguageCode = (lang?: string): string => {
  if (lang === "hi") return "hi-IN";
  return "en-IN";
};

/**
 * Clean phone number for resilient matching
 */
const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+]/g, "");
};

/**
 * POST /api/v1/voice/inbound
 * Public / Telephony Webhook for incoming voice calls.
 * Mandatory AI Voice Disclosure:
 * "This call is answered by ShopEase AI assistant and may be recorded for quality purposes."
 */
export const handleInboundCall = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const callSid =
      req.body.CallSid ||
      req.body.callSid ||
      req.query.CallSid ||
      `CA-${crypto.randomUUID().slice(0, 16)}`;

    const fromRaw =
      req.body.From ||
      req.body.from ||
      req.body.callerNumber ||
      req.query.From ||
      "+910000000000";

    const callerNumber = cleanPhoneNumber(String(fromRaw));

    // Try to match registered customer by phone number
    const matchedUser = await User.findOne({
      phone: { $regex: callerNumber.replace("+91", "").replace("+", "") },
      role: "customer",
    });

    const callerName = matchedUser?.name || String(req.body.CallerName || "Valued Shopper");
    const preferredLang = matchedUser?.preferredLanguage || "en";

    const disclosureText =
      "Welcome to ShopEase Support. This call is answered by ShopEase AI customer assistant and may be recorded for quality and support purposes.";

    const greetingText = matchedUser
      ? `Hello ${callerName}! How can I assist you with your orders or returns today?`
      : "How can I help you with your order, delivery, or return today?";

    // Create or initialize the CallLog session
    let callLog = await CallLog.findOne({ callSid });
    if (!callLog) {
      callLog = await CallLog.create({
        callSid,
        callerNumber,
        callerName,
        customerId: matchedUser?._id,
        callStatus: "inbound",
        language: preferredLang,
        transcript: [
          {
            speaker: "system",
            text: disclosureText,
            timestamp: new Date(),
          },
          {
            speaker: "ai",
            text: greetingText,
            timestamp: new Date(),
          },
        ],
      });
    }

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol;
    const speechActionUrl = `${protocol}://${host}/api/v1/voice/process-speech`;
    const transferUrl = `${protocol}://${host}/api/v1/voice/transfer`;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${getVoiceLanguageCode(preferredLang)}" voice="Polly.Aditi">${escapeXml(disclosureText)}</Say>
  <Gather input="speech dtmf" action="${speechActionUrl}" method="POST" timeout="5" numDigits="1">
    <Say language="${getVoiceLanguageCode(preferredLang)}" voice="Polly.Aditi">${escapeXml(greetingText)} You can ask a question, or press 0 to speak directly to a human support agent.</Say>
  </Gather>
  <Say language="${getVoiceLanguageCode(preferredLang)}" voice="Polly.Aditi">We didn't catch your response. Let me connect you with an agent.</Say>
  <Redirect>${transferUrl}</Redirect>
</Response>`;

    // Check if client expects JSON or XML
    const isJsonPreferred =
      req.headers.accept?.includes("application/json") || req.query.format === "json";

    if (isJsonPreferred) {
      res.status(200).json({
        success: true,
        callSid,
        callerName,
        callerNumber,
        customerId: matchedUser?._id,
        disclosure: disclosureText,
        greeting: greetingText,
        speechActionUrl,
        transferUrl,
        twiml,
      });
      return;
    }

    res.status(200).type("application/xml").send(twiml);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/voice/process-speech
 * Telephony Webhook receiving transcribed speech input from caller.
 */
export const handleProcessSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const callSid = req.body.CallSid || req.body.callSid || req.query.CallSid;
    const digits = req.body.Digits || req.body.digits;
    const speechResult =
      req.body.SpeechResult ||
      req.body.speechResult ||
      req.body.text ||
      req.body.Body ||
      "";

    const fromRaw =
      req.body.From ||
      req.body.from ||
      req.body.callerNumber ||
      req.query.From ||
      "";

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol;
    const speechActionUrl = `${protocol}://${host}/api/v1/voice/process-speech`;

    // Locate CallLog
    let callLog: ICallLog | null = null;
    if (callSid) {
      callLog = await CallLog.findOne({ callSid });
    }

    // Direct DTMF '0' or empty transfer request
    if (digits === "0" || /^(0|operator|agent|human|representative)$/i.test(speechResult.trim())) {
      if (callLog) {
        callLog.transcript.push({
          speaker: "customer",
          text: digits ? `[Pressed DTMF ${digits}]` : speechResult,
          timestamp: new Date(),
        });
        callLog.transcript.push({
          speaker: "system",
          text: "Caller requested immediate human transfer.",
          timestamp: new Date(),
        });
        callLog.callStatus = "transferred";
        callLog.escalatedToAgent = true;
        callLog.escalationReason = "customer_dtmf_zero_or_keyword";
        await callLog.save();
      }

      const transferTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Connecting you directly to a human support specialist right now. Please hold.</Say>
  <Dial timeout="30">${DEFAULT_SUPPORT_NUMBER}</Dial>
</Response>`;

      if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
        res.status(200).json({
          success: true,
          transferred: true,
          message: "Transferring to human support agent",
          twiml: transferTwiml,
        });
        return;
      }

      res.status(200).type("application/xml").send(transferTwiml);
      return;
    }

    if (!speechResult.trim()) {
      const retryTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" action="${speechActionUrl}" method="POST" timeout="5" numDigits="1">
    <Say language="en-IN" voice="Polly.Aditi">Sorry, I did not catch that. Could you please repeat your question? Or press 0 to speak with an agent.</Say>
  </Gather>
  <Say language="en-IN" voice="Polly.Aditi">Thank you for contacting ShopEase. Goodbye!</Say>
  <Hangup/>
</Response>`;

      if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
        res.status(200).json({
          success: true,
          reply: "Sorry, I did not catch that. Could you please repeat your question?",
          twiml: retryTwiml,
        });
        return;
      }
      res.status(200).type("application/xml").send(retryTwiml);
      return;
    }

    // Find customer ID for grounding
    let customerId = callLog?.customerId?.toString();
    if (!customerId && fromRaw) {
      const matched = await User.findOne({
        phone: { $regex: cleanPhoneNumber(String(fromRaw)).replace("+91", "").replace("+", "") },
      });
      if (matched) customerId = matched._id.toString();
    }

    // Record customer utterance
    if (callLog) {
      callLog.transcript.push({
        speaker: "customer",
        text: speechResult,
        timestamp: new Date(),
      });
      callLog.callStatus = "in_progress";
    }

    // Run query through AI Support Pipeline
    const aiResult = await processCustomerQuery({
      customerId: customerId || "",
      message: speechResult,
    });

    const replyText = aiResult.reply;
    const voiceLang = getVoiceLanguageCode(aiResult.analysis.language);

    // Save AI answer into call transcript
    if (callLog) {
      callLog.transcript.push({
        speaker: "ai",
        text: replyText,
        timestamp: new Date(),
      });

      if (aiResult.isEscalated) {
        callLog.callStatus = "transferred";
        callLog.escalatedToAgent = true;
        callLog.escalationReason = aiResult.analysis.intent;
      }
      await callLog.save();
    }

    // If escalation triggered, route to human agent
    if (aiResult.isEscalated) {
      const escalationTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${voiceLang}" voice="Polly.Aditi">${escapeXml(replyText)}</Say>
  <Say language="${voiceLang}" voice="Polly.Aditi">Connecting your call to our human support team for priority assistance. Please hold.</Say>
  <Dial timeout="30">${DEFAULT_SUPPORT_NUMBER}</Dial>
</Response>`;

      if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
        res.status(200).json({
          success: true,
          transferred: true,
          reply: replyText,
          intent: aiResult.analysis.intent,
          twiml: escalationTwiml,
        });
        return;
      }

      res.status(200).type("application/xml").send(escalationTwiml);
      return;
    }

    // Normal AI grounded answer with follow-up gather
    const responseTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${voiceLang}" voice="Polly.Aditi">${escapeXml(replyText)}</Say>
  <Gather input="speech dtmf" action="${speechActionUrl}" method="POST" timeout="6" numDigits="1">
    <Say language="${voiceLang}" voice="Polly.Aditi">Is there anything else I can help you with today? Or press 0 to speak to an agent.</Say>
  </Gather>
  <Say language="${voiceLang}" voice="Polly.Aditi">Thank you for calling ShopEase Support. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

    if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
      res.status(200).json({
        success: true,
        transferred: false,
        reply: replyText,
        intent: aiResult.analysis.intent,
        language: aiResult.analysis.language,
        groundedSources: aiResult.groundedSources,
        twiml: responseTwiml,
      });
      return;
    }

    res.status(200).type("application/xml").send(responseTwiml);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/voice/transfer
 * Immediate transfer webhook
 */
export const handleTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const callSid = req.body.CallSid || req.body.callSid || req.query.CallSid;

    if (callSid) {
      await CallLog.findOneAndUpdate(
        { callSid },
        {
          $set: {
            callStatus: "transferred",
            escalatedToAgent: true,
            escalationReason: "direct_transfer_endpoint",
          },
          $push: {
            transcript: {
              speaker: "system",
              text: "Call transferred to human agent queue",
              timestamp: new Date(),
            },
          },
        }
      );
    }

    const transferTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Connecting you to an agent right now. Please hold.</Say>
  <Dial timeout="30">${DEFAULT_SUPPORT_NUMBER}</Dial>
</Response>`;

    if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
      res.status(200).json({
        success: true,
        message: "Transferred to human agent",
        twiml: transferTwiml,
      });
      return;
    }

    res.status(200).type("application/xml").send(transferTwiml);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/voice/status-callback
 * Telephony webhook reporting call completion / duration
 */
export const handleStatusCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const callSid = req.body.CallSid || req.body.callSid || req.query.CallSid;
    const duration = Number(req.body.CallDuration || req.body.duration || 0);
    const recordingUrl = req.body.RecordingUrl || req.body.recordingUrl;
    const callStatusRaw = req.body.CallStatus || req.body.callStatus;

    if (callSid) {
      const updateData: Record<string, unknown> = { duration };
      if (recordingUrl) updateData.recordingUrl = recordingUrl;
      if (callStatusRaw === "completed") {
        updateData.callStatus = "completed";
      }

      await CallLog.findOneAndUpdate(
        { callSid },
        {
          $set: updateData,
          $push: {
            transcript: {
              speaker: "system",
              text: `Call ended with duration ${duration} seconds.`,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    res.status(200).json({ success: true, message: "Status callback processed" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/voice/logs
 * Staff (Agent and Admin) endpoint to list telephony logs
 */
export const getCallLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.status) {
      filter.callStatus = req.query.status;
    }
    if (req.query.escalated === "true") {
      filter.escalatedToAgent = true;
    }

    const [logs, total] = await Promise.all([
      CallLog.find(filter)
        .populate("customerId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/voice/logs/:id
 * Staff endpoint to get a single call log with full transcript
 */
export const getCallLogById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const log = await CallLog.findById(id).populate("customerId", "name email phone");

    if (!log) {
      throw AppError.notFound("Call log not found");
    }

    res.status(200).json({
      success: true,
      data: { log },
    });
  } catch (error) {
    next(error);
  }
};

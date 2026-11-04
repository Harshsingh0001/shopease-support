import Ticket from "../../models/Ticket.js";
import Message from "../../models/Message.js";
import AuditLog from "../../models/AuditLog.js";
import { classifyIntent } from "./intentClassifier.js";
import { retrieveGroundingContext } from "./contextRetriever.js";
import { generateAiResponse } from "./llmAdapter.js";
import type { AiResponseOutput, IntentAnalysis } from "./aiTypes.js";

interface ProcessCustomerQueryParams {
  customerId: string;
  message: string;
  ticketId?: string;
}

export interface SupportAiResult {
  reply: string;
  analysis: IntentAnalysis;
  groundedSources: string[];
  isEscalated: boolean;
  ticketId?: string;
}

/**
 * Full AI Customer Support Pipeline
 */
export const processCustomerQuery = async ({
  customerId,
  message,
  ticketId,
}: ProcessCustomerQueryParams): Promise<SupportAiResult> => {
  // Step 1: Intent, Language & Escalation Classification
  const analysis = classifyIntent(message);

  // Step 2: Safe, Authorized Grounding Context Retrieval
  const context = await retrieveGroundingContext({
    customerId,
    intent: analysis.intent,
    extractedOrderNumber: analysis.extractedOrderNumber,
    queryText: message,
  });

  // Step 3: Generate Grounded Response (via Gemini or Synthesizer)
  const aiOutput: AiResponseOutput = await generateAiResponse(
    message,
    analysis.language,
    analysis.intent,
    context
  );

  let activeTicketId = ticketId;

  // Step 4: Handle Ticket Association & History Persistence
  if (activeTicketId) {
    const ticket = await Ticket.findById(activeTicketId);

    if (ticket) {
      // Save customer message
      await Message.create({
        ticketId: ticket._id,
        senderId: customerId,
        senderRole: "customer",
        body: message,
        visibility: "customer",
      });

      // Save AI grounded reply
      await Message.create({
        ticketId: ticket._id,
        senderRole: "ai",
        body: aiOutput.replyText,
        visibility: "customer",
      });

      ticket.lastMessageAt = new Date();

      // Step 5: Automatic Human Escalation
      if (aiOutput.isEscalated || analysis.needsHumanEscalation) {
        ticket.status = "in_progress";
        ticket.priority = "high";
        await ticket.save();

        // Audit Log Escalation
        await AuditLog.create({
          actorId: customerId,
          action: "ai_escalated_to_human",
          resourceType: "ticket",
          resourceId: ticket._id,
          details: {
            reason: aiOutput.escalationReason || analysis.escalationReason,
            intent: analysis.intent,
            language: analysis.language,
          },
        });

        // Add internal note for the human agent
        await Message.create({
          ticketId: ticket._id,
          senderRole: "ai",
          body: `🤖 [AI COPILOT SUMMARY]: Customer escalated to human queue. Reason: ${
            aiOutput.escalationReason || "Escalation triggered"
          }. Detected intent: ${analysis.intent} (Language: ${analysis.language}).`,
          visibility: "internal_note",
        });
      } else {
        await ticket.save();
      }
    }
  }

  return {
    reply: aiOutput.replyText,
    analysis,
    groundedSources: aiOutput.groundedSources,
    isEscalated: aiOutput.isEscalated,
    ticketId: activeTicketId,
  };
};

/**
 * Agent Copilot: Draft suggested reply for human agents
 */
export const generateAgentDraftReply = async (
  ticketId: string,
  staffId: string
): Promise<{ draftReply: string; summary: string }> => {
  const ticket = await Ticket.findById(ticketId).populate(
    "customerId",
    "name preferredLanguage"
  );
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const messages = await Message.find({ ticketId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const customerName = (ticket.customerId as unknown as { name?: string })?.name || "Customer";
  const lastCustomerMessage = messages.find((m) => m.senderRole === "customer")?.body || ticket.subject;

  const analysis = classifyIntent(lastCustomerMessage);

  const context = await retrieveGroundingContext({
    customerId: ticket.customerId._id.toString(),
    intent: analysis.intent,
    extractedOrderNumber: analysis.extractedOrderNumber,
    queryText: lastCustomerMessage,
  });

  const aiOutput = await generateAiResponse(
    lastCustomerMessage,
    analysis.language,
    analysis.intent,
    context
  );

  return {
    summary: `Customer is asking about ${analysis.intent.replace("_", " ")} (${analysis.language}).`,
    draftReply: `Hello ${customerName},\n\n${aiOutput.replyText}\n\nPlease let me know if you need any additional assistance.\n\nBest regards,\nShopEase Support Team`,
  };
};

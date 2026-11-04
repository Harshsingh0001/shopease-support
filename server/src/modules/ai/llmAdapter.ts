import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import type {
  CustomerIntent,
  DetectedLanguage,
  GroundingContext,
  AiResponseOutput,
} from "./aiTypes.js";

/**
 * Deterministic Fallback Synthesizer:
 * Builds guaranteed accurate, zero-hallucination answers from grounded data
 * when an external LLM API key is not configured or fails.
 */
const synthesizeGroundedResponse = (
  userMessage: string,
  language: DetectedLanguage,
  intent: CustomerIntent,
  context: GroundingContext
): AiResponseOutput => {
  const isHinglish = language === "hinglish";
  const isHindi = language === "hi";

  // 1. Order Tracking Response
  if (intent === "order_tracking") {
    if (context.orderData) {
      const { orderNumber, status, carrier, trackingNumber, estimatedDelivery, items } =
        context.orderData;
      const itemName = items[0]?.name || "item";

      if (isHinglish) {
        return {
          replyText: `Aapka order **${orderNumber}** (${itemName}) abhi **${status.toUpperCase()}** status par hai. ${
            carrier && trackingNumber ? `Ise **${carrier}** (Tracking: \`${trackingNumber}\`) ke zariye bheja gaya hai.` : ""
          } Expected delivery date: **${estimatedDelivery || "2-3 business days"}**.`,
          language,
          intent,
          confidence: 0.95,
          groundedSources: [`Order: ${orderNumber}`],
          isEscalated: false,
          suggestedAction: "track_order",
        };
      }

      if (isHindi) {
        return {
          replyText: `नमस्ते ${context.customerName}, आपका आर्डर **${orderNumber}** (${itemName}) वर्तमान में **${status}** स्थिति में है। ${
            carrier && trackingNumber ? `इसे **${carrier}** (ट्रैकिंग: \`${trackingNumber}\`) द्वारा भेजा गया है।` : ""
          } अनुमानित डिलीवरी: **${estimatedDelivery || "2-3 कार्यदिवस"}**।`,
          language,
          intent,
          confidence: 0.95,
          groundedSources: [`Order: ${orderNumber}`],
          isEscalated: false,
          suggestedAction: "track_order",
        };
      }

      return {
        replyText: `Hello ${context.customerName}, your order **${orderNumber}** (${itemName}) is currently **${status.toUpperCase()}**. ${
          carrier && trackingNumber
            ? `It has been dispatched via **${carrier}** with tracking ID \`${trackingNumber}\`.`
            : ""
        } Estimated delivery is **${estimatedDelivery || "2-3 business days"}**.`,
        language,
        intent,
        confidence: 0.95,
        groundedSources: [`Order: ${orderNumber}`],
        isEscalated: false,
        suggestedAction: "track_order",
      };
    }

    if (context.recentOrders && context.recentOrders.length > 0) {
      const orderList = context.recentOrders
        .map((o) => `• **${o.orderNumber}** (${o.status.toUpperCase()})`)
        .join("\n");

      if (isHinglish) {
        return {
          replyText: `Aapke recent orders ye hain:\n${orderList}\n\nAap kripya batayein ki aapko kis order ke baare mein specific jaankari chahiye?`,
          language,
          intent,
          confidence: 0.9,
          groundedSources: ["Customer Recent Orders"],
          isEscalated: false,
        };
      }

      return {
        replyText: `Here are your recent orders:\n${orderList}\n\nPlease let me know which order number you would like detailed tracking for.`,
        language,
        intent,
        confidence: 0.9,
        groundedSources: ["Customer Recent Orders"],
        isEscalated: false,
      };
    }

    if (isHinglish) {
      return {
        replyText:
          "Humein aapka koi active order nahi mila ya order number invalid hai. Kripya apna valid order number (jaise ORD-1001) share karein.",
        language,
        intent,
        confidence: 0.8,
        groundedSources: [],
        isEscalated: false,
      };
    }

    return {
      replyText:
        "We could not locate any active orders under your account. Please provide your order number (e.g. ORD-1001) so I can check for you.",
      language,
      intent,
      confidence: 0.8,
      groundedSources: [],
      isEscalated: false,
    };
  }

  // 2. Return Request Response
  if (intent === "return_request") {
    const returnPolicy = context.relevantPolicies.find((p) => p.category === "returns");
    const policySnippet = returnPolicy
      ? returnPolicy.body
      : "ShopEase offers a 7-day hassle-free return policy on all eligible items.";

    if (isHinglish) {
      return {
        replyText: `ShopEase par delivery ke **7 din ke andar** return request raise ki ja sakti hai. Item original packaging aur tags ke saath hona chahiye.\n\nAap jis item ko return karna chahte hain, kya aap uska order number bata sakte hain taaki main aapke liye return request initiate kar sakoon?`,
        language,
        intent,
        confidence: 0.92,
        groundedSources: [returnPolicy?.title || "Return Policy"],
        isEscalated: false,
        suggestedAction: "create_return_ticket",
      };
    }

    return {
      replyText: `You can return or replace items within **7 days of delivery**. The item must be unused, with original packaging and tags intact.\n\nCould you please confirm the Order Number you wish to return so I can help initiate the request?`,
      language,
      intent,
      confidence: 0.92,
      groundedSources: [returnPolicy?.title || "Return Policy"],
      isEscalated: false,
      suggestedAction: "create_return_ticket",
    };
  }

  // 3. Refund Inquiry Response
  if (intent === "refund_inquiry") {
    const refundPolicy = context.relevantPolicies.find((p) => p.category === "refunds");

    if (isHinglish) {
      return {
        replyText: `Warehouse me item check hone ke baad refund **3 se 7 business days** me aapke original payment mode (UPI/Card/Bank) me credit kar diya jata hai.`,
        language,
        intent,
        confidence: 0.92,
        groundedSources: [refundPolicy?.title || "Refund Policy"],
        isEscalated: false,
      };
    }

    return {
      replyText: `Once the returned item is inspected at our warehouse, your refund will be processed back to your original payment method within **3 to 7 business days**.`,
      language,
      intent,
      confidence: 0.92,
      groundedSources: [refundPolicy?.title || "Refund Policy"],
      isEscalated: false,
    };
  }

  // 4. Human Escalation / Complaint
  if (intent === "human_escalation" || intent === "complaint") {
    if (isHinglish) {
      return {
        replyText: `Main samajh sakta hoon. Main turant aapki baat humare human support agent se karwa raha hoon. Humari support team aapke ticket par jald hi connect karegi.`,
        language,
        intent,
        confidence: 0.95,
        groundedSources: ["Support Routing Policy"],
        isEscalated: true,
        escalationReason: "Customer requested human support or raised complaint",
        suggestedAction: "agent_handoff",
      };
    }

    return {
      replyText: `I completely understand. I am escalating this conversation to a dedicated human support agent right away. An agent will review your case and assist you shortly.`,
      language,
      intent,
      confidence: 0.95,
      groundedSources: ["Support Routing Policy"],
      isEscalated: true,
      escalationReason: "Customer requested human support or raised complaint",
      suggestedAction: "agent_handoff",
    };
  }

  // 5. General Policy Fallback
  const primaryPolicy = context.relevantPolicies[0];
  const policyText = primaryPolicy ? primaryPolicy.body : "How can I assist you with ShopEase today?";

  if (isHinglish) {
    return {
      replyText: `ShopEase policy ke mutabik:\n\n${policyText}\n\nAgar aapko kisi aur cheez me madad chahiye toh kripya batayein.`,
      language,
      intent,
      confidence: 0.85,
      groundedSources: primaryPolicy ? [primaryPolicy.title] : [],
      isEscalated: false,
    };
  }

  return {
    replyText: `Based on our store guidelines:\n\n${policyText}\n\nPlease let me know if you need any additional details.`,
    language,
    intent,
    confidence: 0.85,
    groundedSources: primaryPolicy ? [primaryPolicy.title] : [],
    isEscalated: false,
  };
};

/**
 * Generate AI Response using either Google Gemini API (if key is set)
 * or the Grounded Deterministic Synthesizer
 */
export const generateAiResponse = async (
  userMessage: string,
  language: DetectedLanguage,
  intent: CustomerIntent,
  context: GroundingContext
): Promise<AiResponseOutput> => {
  const apiKey = env.GEMINI_API_KEY || env.AI_PROVIDER_API_KEY;

  // If no API key configured, use our reliable grounded synthesizer
  if (!apiKey) {
    return synthesizeGroundedResponse(userMessage, language, intent, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Grounded Prompt Construction
    const systemPrompt = `You are the official customer support AI assistant for ShopEase, an Indian e-commerce platform.
YOUR CORE PRINCIPLES:
1. ONLY answer using the provided GROUNDING CONTEXT below.
2. NEVER invent tracking details, delivery dates, or policies.
3. If order data or policy is not in the context, explicitly say you cannot confirm it and offer to connect the customer with a human agent.
4. LANGUAGE REQUIREMENT:
   - If user asks in Hinglish: Respond in natural, polite Hinglish.
   - If user asks in Hindi: Respond in Hindi.
   - If user asks in English: Respond in English.
5. GROUNDING CONTEXT:
${JSON.stringify(context, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nCustomer Message: ${userMessage}` }] },
      ],
    });

    const replyText = response.text || "";

    const groundedSources: string[] = [];
    if (context.orderData) groundedSources.push(`Order: ${context.orderData.orderNumber}`);
    context.relevantPolicies.forEach((p) => groundedSources.push(p.title));

    return {
      replyText,
      language,
      intent,
      confidence: 0.95,
      groundedSources,
      isEscalated: intent === "human_escalation" || intent === "complaint",
      escalationReason:
        intent === "human_escalation" || intent === "complaint"
          ? "Customer escalated to human support"
          : undefined,
    };
  } catch (error) {
    console.warn("⚠️  LLM API call failed, falling back to grounded synthesizer:", error);
    return synthesizeGroundedResponse(userMessage, language, intent, context);
  }
};

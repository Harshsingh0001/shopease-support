import type { CustomerIntent, DetectedLanguage, IntentAnalysis } from "./aiTypes.js";

/**
 * Detect language: English, Hindi (Devanagari), or Hinglish (Latin code-mixed)
 */
export const detectLanguage = (text: string): DetectedLanguage => {
  // Check for Devanagari script (Hindi)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return "hi";
  }

  // Common Hinglish markers
  const hinglishMarkers = [
    /\bmera\b/i, /\bmeri\b/i, /\bmere\b/i, /\bkab\b/i, /\baayega\b/i,
    /\bkahan\b/i, /\bchahiye\b/i, /\bkitne\b/i, /\bdin\b/i, /\bnahi\b/i,
    /\bhua\b/i, /\bkar\b/i, /\bsakte\b/i, /\bpaise\b/i, /\bwapas\b/i,
    /\bkaro\b/i, /\bbatao\b/i, /\bbaat\b/i, /\bkarni\b/i, /\bhai\b/i,
    /\bkuch\b/i, /\bkyu\b/i, /\bkyun\b/i, /\bbhi\b/i, /\bho\b/i,
    /\bkharab\b/i, /\bbekarr\b/i, /\bjaldi\b/i, /\bpahucha\b/i,
  ];

  const hinglishMatchCount = hinglishMarkers.filter((regex) => regex.test(text)).length;

  if (hinglishMatchCount >= 1) {
    return "hinglish";
  }

  return "en";
};

/**
 * Extract order number if mentioned in user text (e.g. ORD-1001)
 */
export const extractOrderNumber = (text: string): string | undefined => {
  const match = text.match(/\bORD-?\d{4,6}\b/i);
  if (!match) return undefined;
  // Normalize to standard "ORD-XXXX" format
  const raw = match[0].toUpperCase();
  if (!raw.includes("-")) {
    return `ORD-${raw.replace("ORD", "")}`;
  }
  return raw;
};

/**
 * Classify customer message intent, confidence, and determine if human handoff is needed
 */
export const classifyIntent = (text: string): IntentAnalysis => {
  const normalized = text.toLowerCase();
  const language = detectLanguage(text);
  const orderNumber = extractOrderNumber(text);

  // 1. Explicit Human Escalation Triggers
  const humanEscalationPatterns = [
    /human/i, /agent/i, /representative/i, /executive/i, /person/i,
    /real person/i, /talk to human/i, /speak to someone/i,
    /agent se baat/i, /insan se baat/i, /kisi se baat/i, /customer care/i,
  ];

  if (humanEscalationPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "human_escalation",
      confidence: 0.95,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: true,
      escalationReason: "Customer explicitly requested a human support agent",
    };
  }

  // 2. Severe Complaint & Distress Triggers
  const complaintPatterns = [
    /fraud/i, /scam/i, /cheating/i, /worst/i, /terrible/i, /pathetic/i,
    /police/i, /consumer court/i, /lawyer/i, /legal/i, /chor/i, /dhokha/i,
    /loot/i, /bakwas/i, /unacceptable/i,
  ];

  if (complaintPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "complaint",
      confidence: 0.9,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: true,
      escalationReason: "Customer expresses severe dissatisfaction or legal/fraud concern",
    };
  }

  // 3. Return / Replacement
  const returnPatterns = [
    /return/i, /replace/i, /exchange/i, /damaged/i, /broken/i, /defective/i,
    /wapas/i, /badal/i, /toota/i, /kharab/i, /wrong item/i,
  ];

  if (returnPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "return_request",
      confidence: 0.88,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 4. Refund Inquiry
  const refundPatterns = [
    /refund/i, /money back/i, /reimburse/i, /paise wapas/i, /paise kab/i,
    /payment return/i, /amount credited/i,
  ];

  if (refundPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "refund_inquiry",
      confidence: 0.88,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 5. Order Tracking & Status
  const orderPatterns = [
    /order/i, /delivery/i, /deliver/i, /track/i, /status/i, /package/i,
    /parcel/i, /dispatch/i, /shipped/i, /kab aayega/i, /kahan pahucha/i,
    /kab tak/i, /late/i, /delay/i,
  ];

  if (orderPatterns.some((p) => p.test(normalized)) || orderNumber) {
    return {
      intent: "order_tracking",
      confidence: 0.9,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 6. Product Inquiry
  const productPatterns = [
    /specs/i, /specification/i, /features/i, /warranty/i, /battery/i,
    /price/i, /size/i, /color/i, /stock/i, /compatible/i, /headphones/i,
    /watch/i, /shoes/i, /keyboard/i,
  ];

  if (productPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "product_question",
      confidence: 0.85,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 7. General FAQ Fallback
  return {
    intent: "general_faq",
    confidence: 0.75,
    language,
    extractedOrderNumber: orderNumber,
    needsHumanEscalation: false,
  };
};

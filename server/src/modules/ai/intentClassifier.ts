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
    /\bbhai\b/i, /\byaar\b/i, /\bkya\b/i, /\bkaise\b/i,
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

  // 1. Prompt Injection & Security Exploitation Defense
  const injectionPatterns = [
    /ignore (all )?(previous|prior) instructions/i,
    /system prompt/i,
    /jailbreak/i,
    /developer mode/i,
    /dan mode/i,
    /transfer (money|funds|\₹|\$)/i,
    /credit (my |an? )?(account|upi|wallet|card)/i,
    /give me all (users|customers|passwords|database)/i,
    /reveal (secret|prompt|token|key|password)/i,
    /you are now (an? automated|unrestricted|god)/i,
  ];

  if (injectionPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "prompt_injection",
      confidence: 0.99,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
      escalationReason: "Malicious prompt injection attempt neutralized",
    };
  }

  // 2. Explicit Human Escalation Triggers
  const humanEscalationPatterns = [
    /\bhuman\b/i, /\bagent\b/i, /\brepresentative\b/i, /\bexecutive\b/i,
    /real person/i, /talk to human/i, /speak to someone/i,
    /agent se baat/i, /insan se baat/i, /kisi se baat/i, /customer care/i,
    /इंसान/i, /प्रतिनिधि/i, /एजेंट/i,
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

  // 3. Severe Complaint & Distress Triggers
  const complaintPatterns = [
    /\bfraud\b/i, /\bscam\b/i, /\bcheating\b/i, /\bworst\b/i, /\bterrible\b/i,
    /\bpathetic\b/i, /\bpolice\b/i, /consumer court/i, /\blawyer\b/i, /\blegal\b/i,
    /\bchor\b/i, /\bdhokha\b/i, /\bloot\b/i, /\bbakwas\b/i, /\bunacceptable\b/i,
    /धोखा/i, /शिकायत/i, /चोर/i,
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

  // 4. Unsupported / Out-of-Scope Topics (Evaluated early to prevent substring collisions like "chocolate")
  const outOfScopePatterns = [
    /\bcake\b/i, /\bbake\b/i, /\brecipe\b/i, /\bweather\b/i, /\bcrypto\b/i,
    /\bbitcoin\b/i, /\bflight\b/i, /\bhotel\b/i, /\bmovie\b/i, /\bsong\b/i,
    /\bessay\b/i, /\bhomework\b/i, /capital of/i, /who is the president/i,
    /write code/i,
  ];

  if (outOfScopePatterns.some((p) => p.test(normalized))) {
    return {
      intent: "unsupported_query",
      confidence: 0.95,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 5. Order Cancellation Triggers
  const cancelPatterns = [
    /\bcancel\b/i, /cancel order/i, /order cancel/i, /cancel my order/i,
    /रद्द/i, /cancel kar do/i, /nahi chahiye/i,
  ];

  if (cancelPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "cancel_order",
      confidence: 0.95,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 6. Address Modification Triggers
  const addressPatterns = [
    /change (my )?(delivery )?address/i,
    /update (my )?(delivery )?address/i,
    /address change/i,
    /address badal/i,
    /delivery address/i,
    /wrong address/i,
    /नया पता/i,
    /पता बदल/i,
  ];

  if (addressPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "change_address",
      confidence: 0.92,
      language,
      extractedOrderNumber: orderNumber,
      extractedAddress: text,
      needsHumanEscalation: false,
    };
  }

  // 7. GST Tax Invoice & Bill Request
  const invoicePatterns = [
    /\binvoice\b/i, /\btax invoice\b/i, /\bbill\b/i, /\breceipt\b/i,
    /gst invoice/i, /download invoice/i, /bill bhejo/i, /बिल/i, /रसीद/i,
  ];

  if (invoicePatterns.some((p) => p.test(normalized))) {
    return {
      intent: "invoice_request",
      confidence: 0.92,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 8. Discount, Compensation & Goodwill Vouchers
  const discountPatterns = [
    /\bdiscount\b/i, /\bcoupon\b/i, /\bvoucher\b/i, /\bpromo code\b/i,
    /\bcompensation\b/i, /delay compensation/i, /apology/i, /free shipping code/i,
    /छूट/i, /कूपन/i, /offer code/i,
  ];

  if (discountPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "discount_compensation",
      confidence: 0.9,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 9. Hardware Diagnostic & Troubleshooting Triggers
  const diagnosticPatterns = [
    /not (connecting|pairing|charging|turning on)/i,
    /bluetooth (issue|error|fail|disconnecting)/i,
    /troubleshoot/i,
    /audio cut/i,
    /mic not working/i,
    /sound issue/i,
    /battery drain/i,
    /काम नहीं कर रहा/i,
  ];

  if (diagnosticPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "hardware_diagnostic",
      confidence: 0.88,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 10. Product Recommendations & Curated Suggestions
  const recommendationPatterns = [
    /\brecommend\b/i, /\bsuggest\b/i, /\bbest .* under\b/i, /\btop rated\b/i,
    /\bshow products\b/i, /which one should i buy/i, /sujhav/i, /सुझाव/i,
  ];

  if (recommendationPatterns.some((p) => p.test(normalized))) {
    return {
      intent: "product_recommendation",
      confidence: 0.88,
      language,
      extractedOrderNumber: orderNumber,
      needsHumanEscalation: false,
    };
  }

  // 11. Return / Replacement
  const returnPatterns = [
    /\breturn\b/i, /\breplace\b/i, /\bexchange\b/i, /\bdamaged\b/i, /\bbroken\b/i,
    /\bdefective\b/i, /\bwapas\b/i, /\bbadal\b/i, /\btoota\b/i, /\bkharab\b/i,
    /wrong item/i, /वापस/i, /बदल/i, /टूटा/i, /खराब/i,
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

  // 12. Refund Inquiry
  const refundPatterns = [
    /\brefund\b/i, /money back/i, /\breimburse\b/i, /paise wapas/i, /paise kab/i,
    /payment return/i, /amount credited/i, /रिफंड/i, /पैसे/i, /खाते में/i,
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

  // 13. Order Tracking & Status (Using word boundaries to avoid false positives like "chocolate" containing "late")
  const orderPatterns = [
    /\border\b/i, /\bdelivery\b/i, /\bdeliver\b/i, /\btrack\b/i, /\bstatus\b/i,
    /\bpackage\b/i, /\bparcel\b/i, /\bdispatch\b/i, /\bshipped\b/i,
    /kab aayega/i, /kahan pahucha/i, /kab tak/i, /\blate\b/i, /\bdelay\b/i,
    /आर्डर/i, /ऑर्डर/i, /डिलीवरी/i, /पहुँचेगा/i,
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

  // 8. Product Inquiry
  const productPatterns = [
    /\bspecs\b/i, /\bspecification\b/i, /\bfeatures\b/i, /\bwarranty\b/i,
    /\bbattery\b/i, /\bprice\b/i, /\bsize\b/i, /\bcolor\b/i, /\bstock\b/i,
    /\bcompatible\b/i, /\bheadphones\b/i, /\bwatch\b/i, /\bshoes\b/i, /\bkeyboard\b/i,
    /वारंटी/i, /कीमत/i, /फीचर्स/i,
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

  // 9. General FAQ Fallback
  return {
    intent: "general_faq",
    confidence: 0.75,
    language,
    extractedOrderNumber: orderNumber,
    needsHumanEscalation: false,
  };
};

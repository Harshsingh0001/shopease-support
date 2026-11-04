export type CustomerIntent =
  | "order_tracking"
  | "return_request"
  | "refund_inquiry"
  | "product_question"
  | "complaint"
  | "human_escalation"
  | "general_faq";

export type DetectedLanguage = "en" | "hi" | "hinglish";

export interface IntentAnalysis {
  intent: CustomerIntent;
  confidence: number;
  language: DetectedLanguage;
  extractedOrderNumber?: string;
  needsHumanEscalation: boolean;
  escalationReason?: string;
}

export interface GroundingContext {
  customerName: string;
  preferredLanguage: string;
  orderData?: {
    orderNumber: string;
    status: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: { city: string; state: string };
  };
  recentOrders?: Array<{
    orderNumber: string;
    status: string;
    placedAt: string;
    totalAmount: number;
  }>;
  relevantPolicies: Array<{
    title: string;
    category: string;
    body: string;
  }>;
}

export interface AiResponseOutput {
  replyText: string;
  language: DetectedLanguage;
  intent: CustomerIntent;
  confidence: number;
  groundedSources: string[];
  isEscalated: boolean;
  escalationReason?: string;
  suggestedAction?: "track_order" | "create_return_ticket" | "agent_handoff" | "none";
}

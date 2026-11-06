export type CustomerIntent =
  | "order_tracking"
  | "return_request"
  | "refund_inquiry"
  | "product_question"
  | "complaint"
  | "human_escalation"
  | "unsupported_query"
  | "prompt_injection"
  | "general_faq"
  | "cancel_order"
  | "change_address"
  | "discount_compensation"
  | "product_recommendation"
  | "invoice_request"
  | "hardware_diagnostic"
  | "order_payment_restriction"
  | "issue_resolved"
  | "need_more_help";

export type DetectedLanguage = "en" | "hi" | "hinglish";

export interface IntentAnalysis {
  intent: CustomerIntent;
  confidence: number;
  language: DetectedLanguage;
  extractedOrderNumber?: string;
  extractedAddress?: string;
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
    shippingAddress: { street?: string; city: string; state: string; postalCode?: string };
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

export interface ActionPayload {
  type:
    | "carrier_telemetry"
    | "product_recommendations"
    | "cancellation_approval_request"
    | "address_change_approval_request"
    | "agent_transfer"
    | "tax_invoice"
    | "device_troubleshooter"
    | "related_options";
  data: Record<string, any>;
}

export interface AiResponseOutput {
  replyText: string;
  language: DetectedLanguage;
  intent: CustomerIntent;
  confidence: number;
  groundedSources: string[];
  isEscalated: boolean;
  escalationReason?: string;
  suggestedAction?:
    | "track_order"
    | "create_return_ticket"
    | "agent_handoff"
    | "none"
    | "view_products"
    | "apply_coupon"
    | "print_invoice";
  agentThoughtProcess?: string[];
  actionPayload?: ActionPayload;
}

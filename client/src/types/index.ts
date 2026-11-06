export type UserRole = "customer" | "agent" | "supervisor" | "admin";
export type UserLanguage = "en" | "hi" | "hinglish";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: UserLanguage;
  status: "active" | "suspended";
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  image?: string;
  badge?: string;
  tags?: string[];
  active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  placedAt: string;
  estimatedDelivery?: string;
  shippingAddress: ShippingAddress;
  carrier?: string;
  trackingNumber?: string;
}

export type TicketCategory =
  | "order_issue"
  | "product_inquiry"
  | "return_request"
  | "general"
  | "complaint";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    preferredLanguage?: UserLanguage;
  };
  assignedAgentId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  orderId?: {
    _id: string;
    orderNumber: string;
    status: string;
    totalAmount?: number;
  } | null;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  channel: "web_chat" | "email" | "voice";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  ticketId: string;
  senderId?: {
    _id: string;
    name: string;
    role: UserRole;
  };
  senderRole: "customer" | "agent" | "admin" | "ai" | "system";
  body: string;
  visibility: "customer" | "internal_note";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface KnowledgeArticle {
  _id: string;
  title: string;
  slug?: string;
  category: "shipping" | "returns" | "refunds" | "warranty" | "orders" | "general" | string;
  body?: string;
  content?: string;
  tags?: string[];
  published?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TranscriptEntry {
  speaker: "customer" | "ai" | "agent" | "system";
  text: string;
  timestamp: string;
}

export interface CallLog {
  _id: string;
  callSid: string;
  callerNumber: string;
  callerName?: string;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  callStatus: "inbound" | "in_progress" | "completed" | "transferred" | "failed";
  duration: number;
  recordingUrl?: string;
  language: "en" | "hi" | "hinglish";
  transcript: TranscriptEntry[];
  ticketId?: string;
  escalatedToAgent: boolean;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequest {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  reason: "defective" | "wrong_item" | "size_fit" | "not_as_described" | "changed_mind";
  description: string;
  status: "pending_review" | "approved" | "pickup_scheduled" | "refund_processed" | "rejected";
  refundAmount: number;
  requestedAt: string;
  updatedAt: string;
  trackingAwb?: string;
}

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  preferredLanguage: UserLanguage;
  totalOrders: number;
  totalSpend: number;
  openTickets: number;
  registeredAt: string;
  status: "active" | "suspended";
}

export interface AiConversationLog {
  _id: string;
  conversationId: string;
  customerName: string;
  customerEmail: string;
  query: string;
  response: string;
  intent: string;
  groundedSources: string[];
  confidence: number;
  isEscalated: boolean;
  escalationReason?: string;
  timestamp: string;
  status: "resolved" | "escalated" | "flagged";
}

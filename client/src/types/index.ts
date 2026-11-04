export type UserRole = "customer" | "agent" | "admin";
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
  stock: number;
  rating?: number;
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

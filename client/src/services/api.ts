import type {
  User,
  Product,
  Order,
  Ticket,
  Message,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
  UserLanguage,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" ? "/api/v1" : "http://localhost:5000/api/v1");

class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("shopease_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("shopease_token");
      localStorage.removeItem("shopease_user");
    }
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      data.errors
    );
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    register: (payload: {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
      preferredLanguage?: UserLanguage;
    }) =>
      request<{ success: boolean; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    getMe: () => request<{ success: boolean; user: User }>("/auth/me"),
  },

  // Products
  products: {
    list: (params: { page?: number; limit?: number; category?: string; search?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.category) searchParams.set("category", params.category);
      if (params.search) searchParams.set("search", params.search);

      return request<{
        success: boolean;
        data: {
          products: Product[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/products?${searchParams.toString()}`);
    },

    getById: (id: string) =>
      request<{ success: boolean; product: Product }>(`/products/${id}`),
  },

  // Orders
  orders: {
    getMyOrders: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.status) searchParams.set("status", params.status);

      return request<{
        success: boolean;
        data: {
          orders: Order[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/orders/me?${searchParams.toString()}`);
    },

    getAllOrders: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.status) searchParams.set("status", params.status);

      return request<{
        success: boolean;
        data: {
          orders: Order[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/orders/all?${searchParams.toString()}`);
    },

    getById: (id: string) =>
      request<{ success: boolean; order: Order }>(`/orders/${id}`),

    create: (payload: { items: { productId: string; name: string; price: number; quantity: number }[]; shippingAddress?: import("../types").ShippingAddress }) =>
      request<{ success: boolean; order: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    updateStatus: (
      id: string,
      payload: { status?: string; carrier?: string; trackingNumber?: string }
    ) =>
      request<{ success: boolean; order: Order }>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  // Tickets
  tickets: {
    create: (payload: {
      subject: string;
      category: TicketCategory;
      priority?: TicketPriority;
      orderId?: string;
      initialMessage?: string;
    }) =>
      request<{ success: boolean; ticket: Ticket; initialMessage?: Message }>(
        "/tickets",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),

    getMyTickets: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.status) searchParams.set("status", params.status);

      return request<{
        success: boolean;
        data: {
          tickets: Ticket[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/tickets/me?${searchParams.toString()}`);
    },

    getStaffTickets: (params: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      category?: string;
      unassigned?: boolean;
    } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.status) searchParams.set("status", params.status);
      if (params.priority) searchParams.set("priority", params.priority);
      if (params.category) searchParams.set("category", params.category);
      if (params.unassigned) searchParams.set("unassigned", "true");

      return request<{
        success: boolean;
        data: {
          tickets: Ticket[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/tickets/staff?${searchParams.toString()}`);
    },

    getById: (id: string) =>
      request<{ success: boolean; ticket: Ticket }>(`/tickets/${id}`),

    update: (
      id: string,
      payload: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedAgentId?: string | null;
      }
    ) =>
      request<{ success: boolean; ticket: Ticket }>(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),

    getMessages: (ticketId: string) =>
      request<{ success: boolean; count: number; messages: Message[] }>(
        `/tickets/${ticketId}/messages`
      ),

    sendMessage: (
      ticketId: string,
      payload: { body: string; visibility?: "customer" | "internal_note" }
    ) =>
      request<{ success: boolean; data: Message }>(
        `/tickets/${ticketId}/messages`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
  },

  // AI Support & Copilot
  ai: {
    ask: (payload: { message: string; ticketId?: string }) =>
      request<{
        success: boolean;
        reply: string;
        analysis: {
          intent: string;
          confidence: number;
          language: string;
          extractedOrderNumber?: string;
          needsHumanEscalation: boolean;
        };
        groundedSources: string[];
        isEscalated: boolean;
      }>("/support/ask", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    generateDraft: (ticketId: string) =>
      request<{
        success: boolean;
        draftReply: string;
        summary: string;
      }>(`/support/tickets/${ticketId}/ai-draft`, {
        method: "POST",
      }),
  },

  // Voice & Telephony
  voice: {
    simulateInbound: (payload: { callerNumber: string; callerName?: string }) =>
      request<{
        success: boolean;
        callSid: string;
        callerName: string;
        disclosure: string;
        greeting: string;
        twiml: string;
      }>("/voice/inbound?format=json", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    processSpeech: (payload: { callSid: string; text: string; callerNumber: string }) =>
      request<{
        success: boolean;
        transferred: boolean;
        reply: string;
        intent?: string;
        language?: string;
        groundedSources?: string[];
        twiml: string;
      }>("/voice/process-speech?format=json", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    getLogs: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.status) searchParams.set("status", params.status);
      const qs = searchParams.toString();
      return request<{
        success: boolean;
        data: {
          logs: import("../types").CallLog[];
          pagination: { page: number; limit: number; total: number; pages: number };
        };
      }>(`/voice/logs${qs ? `?${qs}` : ""}`);
    },

    getLogById: (id: string) =>
      request<{
        success: boolean;
        data: {
          log: import("../types").CallLog;
        };
      }>(`/voice/logs/${id}`),
  },

  // Knowledge Base Articles
  knowledge: {
    list: (category?: string) =>
      request<{
        success: boolean;
        data: {
          articles: import("../types").KnowledgeArticle[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>(`/knowledge/search${category ? `?category=${category}` : ""}`),

    adminList: () =>
      request<{
        success: boolean;
        data: {
          articles: import("../types").KnowledgeArticle[];
          pagination: { total: number; page: number; pages: number; limit: number };
        };
      }>("/admin/knowledge?limit=50"),

    create: (payload: {
      title: string;
      category: string;
      body: string;
      tags?: string[];
      published?: boolean;
    }) =>
      request<{
        success: boolean;
        article: import("../types").KnowledgeArticle;
      }>("/admin/knowledge", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (
      id: string,
      payload: {
        title?: string;
        category?: string;
        body?: string;
        tags?: string[];
        published?: boolean;
      }
    ) =>
      request<{
        success: boolean;
        article: import("../types").KnowledgeArticle;
      }>(`/admin/knowledge/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/admin/knowledge/${id}`, {
        method: "DELETE",
      }),
  },
};

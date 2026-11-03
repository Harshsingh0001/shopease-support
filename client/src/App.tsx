
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Package,
  PackageCheck,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sun,
  Truck,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

type Page = "Dashboard" | "Products" | "Orders" | "AI Support" | "Customers" | "Settings";
type Theme = "light" | "dark";
type Status = "Delivered" | "In transit" | "Processing" | "Cancelled";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  rating: string;
  sold: number;
};

type Order = {
  id: string;
  customer: string;
  initials: string;
  product: string;
  total: number;
  date: string;
  status: Status;
  payment: string;
};

type Chat = {
  id: number;
  name: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
  online?: boolean;
};

type ChatMessage = {
  id: number;
  sender: "agent" | "customer";
  text: string;
  time: string;
};

const products: Product[] = [
  {
    id: "PRD-001",
    name: "Studio Wireless Headphones",
    category: "Electronics",
    price: 2499,
    stock: 42,
    image: "🎧",
    rating: "4.8",
    sold: 324,
  },
  {
    id: "PRD-002",
    name: "Everyday Smart Watch",
    category: "Wearables",
    price: 3999,
    stock: 18,
    image: "⌚",
    rating: "4.7",
    sold: 216,
  },
  {
    id: "PRD-003",
    name: "Minimal Leather Backpack",
    category: "Accessories",
    price: 1899,
    stock: 7,
    image: "🎒",
    rating: "4.6",
    sold: 184,
  },
  {
    id: "PRD-004",
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    price: 1599,
    stock: 63,
    image: "🔊",
    rating: "4.9",
    sold: 402,
  },
  {
    id: "PRD-005",
    name: "Classic Everyday Sneakers",
    category: "Fashion",
    price: 2799,
    stock: 25,
    image: "👟",
    rating: "4.5",
    sold: 173,
  },
  {
    id: "PRD-006",
    name: "Ceramic Coffee Set",
    category: "Home",
    price: 999,
    stock: 0,
    image: "☕",
    rating: "4.7",
    sold: 98,
  },
];

const initialOrders: Order[] = [
  {
    id: "SE-24081",
    customer: "Aarav Sharma",
    initials: "AS",
    product: "Studio Wireless Headphones",
    total: 2499,
    date: "03 Nov 2026",
    status: "In transit",
    payment: "Paid",
  },
  {
    id: "SE-24080",
    customer: "Priya Verma",
    initials: "PV",
    product: "Everyday Smart Watch",
    total: 3999,
    date: "03 Nov 2026",
    status: "Processing",
    payment: "Paid",
  },
  {
    id: "SE-24079",
    customer: "Rohan Mehta",
    initials: "RM",
    product: "Minimal Leather Backpack",
    total: 1899,
    date: "02 Nov 2026",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "SE-24078",
    customer: "Ananya Gupta",
    initials: "AG",
    product: "Portable Bluetooth Speaker",
    total: 1599,
    date: "02 Nov 2026",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "SE-24077",
    customer: "Kabir Singh",
    initials: "KS",
    product: "Classic Everyday Sneakers",
    total: 2799,
    date: "01 Nov 2026",
    status: "Cancelled",
    payment: "Refunded",
  },
];

const initialChats: Chat[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    initials: "AS",
    subject: "Where is my order?",
    preview: "Can you check the delivery date?",
    time: "2m",
    unread: 2,
    color: "green",
    online: true,
  },
  {
    id: 2,
    name: "Priya Verma",
    initials: "PV",
    subject: "Return & refund",
    preview: "The size doesn't fit me.",
    time: "12m",
    unread: 1,
    color: "rose",
  },
  {
    id: 3,
    name: "Rohan Mehta",
    initials: "RM",
    subject: "Payment question",
    preview: "I was charged twice.",
    time: "25m",
    unread: 0,
    color: "blue",
  },
  {
    id: 4,
    name: "Ananya Gupta",
    initials: "AG",
    subject: "Product availability",
    preview: "When will this be back in stock?",
    time: "1h",
    unread: 0,
    color: "purple",
  },
  {
    id: 5,
    name: "Kabir Singh",
    initials: "KS",
    subject: "Change delivery address",
    preview: "Can I update my address?",
    time: "2h",
    unread: 0,
    color: "amber",
  },
];

const initialMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      sender: "customer",
      text: "Hi! I ordered wireless headphones a couple of days ago. Could you tell me where my order is?",
      time: "10:24 AM",
    },
    {
      id: 2,
      sender: "agent",
      text: "Hi Aarav! 👋 I'd be happy to help you track your order.",
      time: "10:24 AM",
    },
    {
      id: 3,
      sender: "agent",
      text: "I found order #SE-24081. Your headphones have been shipped and are currently in transit. The estimated delivery is tomorrow.",
      time: "10:25 AM",
    },
    {
      id: 4,
      sender: "customer",
      text: "Great, thank you! Can I get the tracking details?",
      time: "10:26 AM",
    },
  ],
  2: [
    {
      id: 1,
      sender: "customer",
      text: "Hello, I received my order but the size doesn't fit me.",
      time: "10:12 AM",
    },
    {
      id: 2,
      sender: "agent",
      text: "I'm sorry the fit wasn't right, Priya. I can help you start a return request.",
      time: "10:13 AM",
    },
  ],
  3: [
    {
      id: 1,
      sender: "customer",
      text: "I think I was charged twice for my last order. Could you check?",
      time: "9:50 AM",
    },
    {
      id: 2,
      sender: "agent",
      text: "I can help you review the payment details. Please allow me a moment to check the order information.",
      time: "9:51 AM",
    },
  ],
  4: [
    {
      id: 1,
      sender: "customer",
      text: "When will the leather backpack be available again?",
      time: "9:10 AM",
    },
    {
      id: 2,
      sender: "agent",
      text: "I'll help you check its current stock and availability.",
      time: "9:11 AM",
    },
  ],
  5: [
    {
      id: 1,
      sender: "customer",
      text: "My order hasn't shipped yet. Can I change the delivery address?",
      time: "8:35 AM",
    },
    {
      id: 2,
      sender: "agent",
      text: "Let's check the order status first to see whether an address update is still possible.",
      time: "8:36 AM",
    },
  ],
};

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Dashboard" as Page, icon: LayoutDashboard },
      { label: "Products" as Page, icon: ShoppingBag },
      { label: "Orders" as Page, icon: Package },
      { label: "AI Support" as Page, icon: MessageCircle, count: "4" },
      { label: "Customers" as Page, icon: Users },
    ],
  },
  {
    label: "PREFERENCES",
    items: [{ label: "Settings" as Page, icon: Settings }],
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function StatusBadge({ status }: { status: Status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${className}`}>{status}</span>;
}

function Avatar({
  initials,
  color = "green",
  large = false,
}: {
  initials: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <div className={`avatar avatar-${color} ${large ? "avatar-large" : ""}`}>
      {initials}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("shopease-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const [page, setPage] = useState<Page>("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [chatFilter, setChatFilter] = useState<"All" | "Unread">("All");
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const [orders] = useState(initialOrders);
  const [chats, setChats] = useState(initialChats);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatDetails, setShowChatDetails] = useState(true);
  const [toast, setToast] = useState("");

  const selectedChat =
    chats.find((chat) => chat.id === selectedChatId) ?? chats[0];

  const activeMessages = messages[selectedChatId] ?? [];

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.category} ${product.id}`
          .toLowerCase()
          .includes(productSearch.toLowerCase()),
      ),
    [productSearch],
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.customer} ${order.product} ${order.status}`
          .toLowerCase()
          .includes(orderSearch.toLowerCase()),
      ),
    [orders, orderSearch],
  );

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) => {
        const matchesSearch =
          `${chat.name} ${chat.subject} ${chat.preview}`
            .toLowerCase()
            .includes(chatSearch.toLowerCase());
        const matchesFilter = chatFilter === "All" || chat.unread > 0;
        return matchesSearch && matchesFilter;
      }),
    [chats, chatSearch, chatFilter],
  );

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("shopease-theme", nextTheme);
    } catch {
      // The UI still switches if browser storage is unavailable.
    }
  }

  function sendMessage(text = messageDraft) {
    const content = text.trim();
    if (!content) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: "agent",
      text: content,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((current) => ({
      ...current,
      [selectedChatId]: [...(current[selectedChatId] ?? []), newMessage],
    }));
    setChats((current) =>
      current.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, preview: content, time: "now", unread: 0 }
          : chat,
      ),
    );
    setMessageDraft("");
  }

  function selectChat(id: number) {
    setSelectedChatId(id);
    setChats((current) =>
      current.map((chat) => (chat.id === id ? { ...chat, unread: 0 } : chat)),
    );
  }

  function startNewChat() {
    const id = Date.now();
    const newChat: Chat = {
      id,
      name: "New customer",
      initials: "NC",
      subject: "New conversation",
      preview: "Conversation started",
      time: "now",
      unread: 0,
      color: "green",
      online: true,
    };
    setChats((current) => [newChat, ...current]);
    setMessages((current) => ({
      ...current,
      [id]: [
        {
          id: Date.now() + 1,
          sender: "agent",
          text: "Hello! Welcome to ShopEase Support. How can I help you today?",
          time: "Just now",
        },
      ],
    }));
    setSelectedChatId(id);
    setPage("AI Support");
    notify("New conversation created");
  }

  function quickReply(kind: "tracking" | "return" | "human") {
    const replies = {
      tracking:
        "I'd be happy to help track your order. Please share your order ID so I can check the latest delivery status.",
      return:
        "I can help you with a return. Please share your order ID and the item you'd like to return so we can review the next steps.",
      human:
        "I'll help you connect with a support specialist. Please tell me a convenient time to reach you.",
    };
    sendMessage(replies[kind]);
  }

  
  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <ShoppingBag size={23} strokeWidth={2.2} />
            <span className="brand-spark">✦</span>
          </div>
          <div>
            <div className="brand-name">ShopEase</div>
            <div className="brand-caption">SMARTER SHOPPING. BETTER SUPPORT.</div>
          </div>
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-logo">S</div>
          <div className="workspace-copy">
            <strong>ShopEase Store</strong>
            <span>Customer experience</span>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav className="side-navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map(({ label, icon: Icon, count }) => (
                <button
                  key={label}
                  className={`nav-item ${page === label ? "nav-item-active" : ""}`}
                  onClick={() => {
                    setPage(label);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  {count && <span className="nav-count">{count}</span>}
                  {page === label && <span className="nav-active-dot" />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="support-plan">
          <div className="plan-icon">
            <Zap size={18} />
          </div>
          <div className="plan-title">Support that scales</div>
          <p>Make every customer interaction count.</p>
          <div className="plan-meter">
            <span />
          </div>
          <div className="plan-foot">
            <span>AI support usage</span>
            <strong>72%</strong>
          </div>
        </div>

        <button
          className="sidebar-user"
          onClick={() => setShowProfile((current) => !current)}
        >
          <Avatar initials="HS" color="gold" />
          <span className="sidebar-user-copy">
            <strong>Harsh Singh</strong>
            <small>Store administrator</small>
          </span>
          <MoreHorizontal size={18} />
        </button>

        {showProfile && (
          <div className="profile-popover">
            <strong>Harsh Singh</strong>
            <span>admin@shopease.demo</span>
            <button onClick={() => setPage("Settings")}>
              <Settings size={15} /> Account settings
            </button>
            <button onClick={() => notify("Connect logout to your auth API next.")}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </aside>

      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{page}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input
                aria-label="Search workspace"
                placeholder="Search anything..."
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && globalSearch.trim()) {
                    setProductSearch(globalSearch);
                    setOrderSearch(globalSearch);
                    setChatSearch(globalSearch);
                    notify(`Searching for “${globalSearch}”`);
                  }
                }}
              />
              <kbd>↵</kbd>
            </label>
            <div className="topbar-divider" />
            <button
              className="icon-button theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((current) => !current)}
              >
                <Bell size={18} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  <div className="notification-item">
                    <span className="notification-icon"><PackageCheck size={16} /></span>
                    <span><b>Order update</b><small>SE-24081 is in transit.</small></span>
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon"><MessageCircle size={16} /></span>
                    <span><b>New support messages</b><small>4 conversations need attention.</small></span>
                  </div>
                </div>
              )}
            </div>
            <button
              className="topbar-avatar"
              aria-label="Open profile"
              onClick={() => setShowProfile((current) => !current)}
            >
              HS
            </button>
          </div>
        </header>

        <div className="page-content">
          {page === "Dashboard" && (
            <DashboardPage
              orders={orders}
              onNavigate={setPage}
              onOpenOrder={setSelectedOrder}
            />
          )}

          {page === "Products" && (
            <ProductsPage
              products={filteredProducts}
              search={productSearch}
              setSearch={setProductSearch}
              onOpenProduct={setSelectedProduct}
              onAddProduct={() => notify("Product creation will be connected to the backend next.")}
            />
          )}

          {page === "Orders" && (
            <OrdersPage
              orders={filteredOrders}
              search={orderSearch}
              setSearch={setOrderSearch}
              onOpenOrder={setSelectedOrder}
            />
          )}

          {page === "Customers" && (
            <CustomersPage
              chats={chats}
              onOpenChat={(id) => {
                selectChat(id);
                setPage("AI Support");
              }}
            />
          )}

          {page === "AI Support" && (
            <SupportPage
              chats={filteredChats}
              selectedChat={selectedChat}
              selectedChatId={selectedChatId}
              messages={activeMessages}
              search={chatSearch}
              setSearch={setChatSearch}
              filter={chatFilter}
              setFilter={setChatFilter}
              draft={messageDraft}
              setDraft={setMessageDraft}
              onSelectChat={selectChat}
              onSend={sendMessage}
              onNewChat={startNewChat}
              onQuickReply={quickReply}
              showDetails={showChatDetails}
              setShowDetails={setShowChatDetails}
            />
          )}

          {page === "Settings" && (
            <SettingsPage
              theme={theme}
              onToggleTheme={toggleTheme}
              onNotify={notify}
            />
          )}
        </div>
      </main>

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close icon-button" onClick={() => setSelectedProduct(null)} aria-label="Close product">
              <X size={18} />
            </button>
            <div className="modal-product-art">{selectedProduct.image}</div>
            <span className="eyebrow">{selectedProduct.category}</span>
            <h2>{selectedProduct.name}</h2>
            <p className="modal-price">{money(selectedProduct.price)}</p>
            <div className="modal-detail-row"><span>Product ID</span><strong>{selectedProduct.id}</strong></div>
            <div className="modal-detail-row"><span>Available stock</span><strong>{selectedProduct.stock} units</strong></div>
            <div className="modal-detail-row"><span>Customer rating</span><strong>★ {selectedProduct.rating}</strong></div>
            <button className="primary-button full-button" onClick={() => { setSelectedProduct(null); notify("Product editing will be connected to the backend next."); }}>
              Edit product <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="detail-modal order-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close icon-button" onClick={() => setSelectedOrder(null)} aria-label="Close order">
              <X size={18} />
            </button>
            <span className="eyebrow">ORDER DETAILS</span>
            <h2>{selectedOrder.id}</h2>
            <StatusBadge status={selectedOrder.status} />
            <div className="modal-detail-row"><span>Customer</span><strong>{selectedOrder.customer}</strong></div>
            <div className="modal-detail-row"><span>Product</span><strong>{selectedOrder.product}</strong></div>
            <div className="modal-detail-row"><span>Order date</span><strong>{selectedOrder.date}</strong></div>
            <div className="modal-detail-row"><span>Payment</span><strong>{selectedOrder.payment}</strong></div>
            <div className="modal-total"><span>Total amount</span><strong>{money(selectedOrder.total)}</strong></div>
            <button className="primary-button full-button" onClick={() => { setSelectedOrder(null); setPage("AI Support"); notify("Open a conversation to contact the customer."); }}>
              <MessageCircle size={16} /> Open support
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-message">
          <Check size={17} /> {toast}
        </div>
      )}
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function DashboardPage({
  orders,
  onNavigate,
  onOpenOrder,
}: {
  orders: Order[];
  onNavigate: (page: Page) => void;
  onOpenOrder: (order: Order) => void;
}) {
  const stats = [
    { label: "Total revenue", value: "₹2,48,560", change: "+12.8%", note: "vs. last month", icon: CreditCard, tone: "green", trend: "up" },
    { label: "Total orders", value: "1,284", change: "+8.2%", note: "vs. last month", icon: ShoppingCart, tone: "blue", trend: "up" },
    { label: "Active customers", value: "864", change: "+5.4%", note: "vs. last month", icon: Users, tone: "purple", trend: "up" },
    { label: "Open support chats", value: "24", change: "6 urgent", note: "need a response", icon: Headphones, tone: "amber", trend: "down" },
  ];

  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;

const pendingCount = orders.filter((order) => order.status === "In transit").length;

  const bars = [32, 48, 39, 60, 45, 68, 52, 73, 56, 82, 62, 91];

  return (
    <>
      <PageHeading
        eyebrow="TUESDAY, NOVEMBER 3"
        title="Good morning, Harsh 👋"
        description="Here's what's happening with your store today."
        action={<button className="primary-button" onClick={() => onNavigate("Products")}><Plus size={16} /> Add product</button>}
      />

      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-pill"><span /> YOUR STORE AT A GLANCE</span>
          <h2>Every order tells a story.</h2>
          <p>Keep your customers happy with one connected workspace for orders, products, and AI-powered support.</p>
          <button className="banner-button" onClick={() => onNavigate("AI Support")}>View support inbox <ArrowRight size={15} /></button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-package"><ShoppingBag size={60} strokeWidth={1.15} /></div>
          <div className="art-spark art-spark-one">✦</div>
          <div className="art-spark art-spark-two">✧</div>
          <div className="art-mini-card"><PackageCheck size={17} /><span><b>Order delivered</b><small>Just now</small></span></div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, change, note, icon: Icon, tone, trend }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon tone-${tone}`}><Icon size={18} /></span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-foot">
              <span className={`stat-change ${trend === "up" ? "positive" : "neutral"}`}>
                {trend === "up" ? <ArrowUpRight size={14} /> : <Activity size={13} />}
                {change}
              </span>
              <span>{note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel revenue-panel">
          <div className="panel-heading">
            <div><h3>Revenue overview</h3><p>Your store's performance</p></div>
            <select className="select-control" defaultValue="7 days" aria-label="Revenue period">
              <option>7 days</option><option>30 days</option><option>12 months</option>
            </select>
          </div>
          <div className="revenue-total"><strong>₹84,250</strong><span className="stat-change positive"><ArrowUpRight size={14} /> 18.6%</span></div>
          <div className="chart">
            <div className="chart-y-labels"><span>₹10k</span><span>₹7.5k</span><span>₹5k</span><span>₹2.5k</span><span>₹0</span></div>
            <div className="chart-plot">
              {[0, 1, 2, 3, 4].map((line) => <div className="chart-gridline" key={line} />)}
              <div className="chart-bars">
                {bars.map((height, index) => (
                  <div className="chart-bar-column" key={index}>
                    <div className={`chart-bar ${index === 9 ? "chart-bar-highlight" : ""}`} style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-x-labels"><span>Oct 28</span><span>Oct 30</span><span>Oct 31</span><span>Nov 01</span><span>Nov 03</span></div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading"><div><h3>Store activity</h3><p>Live business snapshot</p></div><button className="icon-button small-icon" aria-label="More activity options"><MoreHorizontal size={18} /></button></div>
          <div className="activity-list">
            <div className="activity-row"><span className="activity-icon tone-green"><ShoppingCart size={17} /></span><span><b>New orders</b><small>Orders placed today</small></span><strong>36</strong></div>
            <div className="activity-row"><span className="activity-icon tone-blue"><Truck size={17} /></span><span><b>In transit</b><small>On the way to customers</small></span><strong>{pendingCount}</strong></div>
            <div className="activity-row"><span className="activity-icon tone-purple"><PackageCheck size={17} /></span><span><b>Delivered</b><small>Successfully completed</small></span><strong>{deliveredCount}</strong></div>
            <div className="activity-row"><span className="activity-icon tone-amber"><MessageCircle size={17} /></span><span><b>Support requests</b><small>Awaiting a reply</small></span><strong>24</strong></div>
          </div>
          <button className="text-button" onClick={() => onNavigate("Orders")}>View order activity <ArrowRight size={15} /></button>
        </section>
      </div>

      <section className="panel orders-panel">
        <div className="panel-heading">
          <div><h3>Recent orders</h3><p>Track the latest activity in your store.</p></div>
          <button className="text-button" onClick={() => onNavigate("Orders")}>View all orders <ArrowRight size={15} /></button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead>
            <tbody>
              {orders.slice(0, 4).map((order) => (
                <tr key={order.id} onClick={() => onOpenOrder(order)} className="clickable-row">
                  <td><strong className="order-id">{order.id}</strong><small>{order.date}</small></td>
                  <td><div className="table-customer"><Avatar initials={order.initials} color="green" /><strong>{order.customer}</strong></div></td>
                  <td><span className="product-name-cell">{order.product}</span></td>
                  <td><strong>{money(order.total)}</strong></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><button className="icon-button row-action" aria-label={`View ${order.id}`}><ChevronRight size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ProductsPage({
  products,
  search,
  setSearch,
  onOpenProduct,
  onAddProduct,
}: {
  products: Product[];
  search: string;
  setSearch: (value: string) => void;
  onOpenProduct: (product: Product) => void;
  onAddProduct: () => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="STORE MANAGEMENT"
        title="Products"
        description="Manage your catalog, pricing, and stock availability."
        action={<button className="primary-button" onClick={onAddProduct}><Plus size={16} /> Add product</button>}
      />
      <div className="catalog-summary">
        <div><span className="summary-label">Total products</span><strong>{products.length}</strong><small>In this view</small></div>
        <div><span className="summary-label">In stock</span><strong>{products.filter((product) => product.stock > 0).length}</strong><small>Available to sell</small></div>
        <div><span className="summary-label">Low stock</span><strong>{products.filter((product) => product.stock > 0 && product.stock < 10).length}</strong><small>Needs attention</small></div>
        <div><span className="summary-label">Out of stock</span><strong>{products.filter((product) => product.stock === 0).length}</strong><small>Unavailable</small></div>
      </div>
      <div className="toolbar">
        <label className="search-control"><Search size={17} /><input placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <span className="muted-label">{products.length} products</span>
      </div>
      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <button className="product-card" key={product.id} onClick={() => onOpenProduct(product)}>
              <div className={`product-art product-art-${product.category.toLowerCase()}`}><span>{product.image}</span><span className="product-rating">★ {product.rating}</span></div>
              <div className="product-card-body">
                <span className="eyebrow">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="product-price-row"><strong>{money(product.price)}</strong><span className={product.stock === 0 ? "stock-out" : product.stock < 10 ? "stock-low" : "stock-ok"}>{product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</span></div>
                <div className="product-card-foot"><span>{product.sold} sold</span><span>View details <ArrowRight size={14} /></span></div>
              </div>
            </button>
          ))}
        </div>
      ) : <div className="empty-state"><ShoppingBag size={30} /><h3>No products found</h3><p>Try another search term.</p></div>}
    </>
  );
}

function OrdersPage({
  orders,
  search,
  setSearch,
  onOpenOrder,
}: {
  orders: Order[];
  search: string;
  setSearch: (value: string) => void;
  onOpenOrder: (order: Order) => void;
}) {
  return (
    <>
      <PageHeading eyebrow="STORE MANAGEMENT" title="Orders" description="View purchases, payments, and order fulfillment." action={<button className="secondary-button" onClick={() => window.print()}>Export / Print</button>} />
      <div className="catalog-summary">
        <div><span className="summary-label">All orders</span><strong>{orders.length}</strong><small>Demo order records</small></div>
        <div><span className="summary-label">Processing</span><strong>{orders.filter((order) => order.status === "Processing").length}</strong><small>Preparing for dispatch</small></div>
        <div><span className="summary-label">In transit</span><strong>{orders.filter((order) => order.status === "In transit").length}</strong><small>On the way</small></div>
        <div><span className="summary-label">Delivered</span><strong>{orders.filter((order) => order.status === "Delivered").length}</strong><small>Completed orders</small></div>
      </div>
      <section className="panel orders-page-panel">
        <div className="toolbar">
          <label className="search-control"><Search size={17} /><input placeholder="Search order, customer or product..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <span className="muted-label">{orders.length} results</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>PAYMENT</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} onClick={() => onOpenOrder(order)} className="clickable-row">
                  <td><strong className="order-id">{order.id}</strong><small>{order.date}</small></td>
                  <td><div className="table-customer"><Avatar initials={order.initials} color="green" /><strong>{order.customer}</strong></div></td>
                  <td><span className="product-name-cell">{order.product}</span></td>
                  <td><span className="payment-label"><Check size={13} /> {order.payment}</span></td>
                  <td><strong>{money(order.total)}</strong></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><ChevronRight size={17} className="muted-icon" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="empty-state"><Package size={28} /><h3>No orders found</h3><p>Try a different search.</p></div>}
        </div>
      </section>
    </>
  );
}

function SupportPage({
  chats,
  selectedChat,
  selectedChatId,
  messages,
  search,
  setSearch,
  filter,
  setFilter,
  draft,
  setDraft,
  onSelectChat,
  onSend,
  onNewChat,
  onQuickReply,
  showDetails,
  setShowDetails,
}: {
  chats: Chat[];
  selectedChat: Chat;
  selectedChatId: number;
  messages: ChatMessage[];
  search: string;
  setSearch: (value: string) => void;
  filter: "All" | "Unread";
  setFilter: (value: "All" | "Unread") => void;
  draft: string;
  setDraft: (value: string) => void;
  onSelectChat: (id: number) => void;
  onSend: (text?: string) => void;
  onNewChat: () => void;
  onQuickReply: (kind: "tracking" | "return" | "human") => void;
  showDetails: boolean;
  setShowDetails: (value: boolean) => void;
}) {
  return (
    <>
      <PageHeading eyebrow="CUSTOMER EXPERIENCE" title="AI Support" description="Every customer question, all in one place." action={<button className="primary-button" onClick={onNewChat}><Plus size={16} /> New conversation</button>} />
      <div className={`support-layout ${showDetails ? "" : "support-no-details"}`}>
        <aside className="conversation-panel">
          <div className="conversation-panel-heading"><div><h3>Inbox</h3><span>{chats.length} conversations</span></div><button className="icon-button small-icon" onClick={onNewChat} aria-label="New conversation"><Plus size={18} /></button></div>
          <label className="search-control conversation-search"><Search size={16} /><input placeholder="Search conversations..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="conversation-filters">
            {(["All", "Unread"] as const).map((item) => <button key={item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          <div className="conversation-list">
            {chats.map((chat) => (
              <button key={chat.id} className={`conversation-item ${selectedChatId === chat.id ? "conversation-active" : ""}`} onClick={() => onSelectChat(chat.id)}>
                <div className="avatar-wrap"><Avatar initials={chat.initials} color={chat.color} />{chat.online && <span className="online-dot" />}</div>
                <div className="conversation-copy"><div className="conversation-name-row"><strong>{chat.name}</strong><small>{chat.time}</small></div><div className="conversation-subject">{chat.subject}</div><div className="conversation-preview">{chat.preview}</div></div>
                {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
              </button>
            ))}
            {chats.length === 0 && <div className="empty-small">No matching conversations.</div>}
          </div>
          <div className="inbox-footer"><span className="online-dot" /> Inbox is up to date</div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <Avatar initials={selectedChat.initials} color={selectedChat.color} large />
            <div className="chat-header-copy"><strong>{selectedChat.name}</strong><span><span className="online-dot" /> {selectedChat.online ? "Online" : "Customer"} <span className="header-dot">·</span> {selectedChat.subject}</span></div>
            <div className="chat-header-actions">
              <button className="icon-button" title="Search messages" onClick={() => setSearch(selectedChat.name)}><Search size={17} /></button>
              <button className="icon-button" title="Toggle customer details" onClick={() => setShowDetails(!showDetails)}><UserRound size={17} /></button>
              <button className="icon-button" title="More options" onClick={() => onQuickReply("human")}><MoreHorizontal size={18} /></button>
            </div>
          </div>

          <div className="chat-context-banner">
            <div className="context-icon"><ShoppingBag size={27} /></div>
            <div><span className="eyebrow">SHOPEASE CUSTOMER CARE</span><h3>Hi {selectedChat.name.split(" ")[0]}! How can we help?</h3><p>We're here to make shopping easy.</p></div>
            <div className="context-spark">✦</div>
          </div>

          <div className="message-stream">
            <div className="chat-date-divider"><span>Today · November 3</span></div>
            {messages.map((message) => (
              <div className={`message-row ${message.sender === "agent" ? "message-outgoing" : "message-incoming"}`} key={message.id}>
                {message.sender === "customer" && <Avatar initials={selectedChat.initials} color={selectedChat.color} />}
                <div className="message-content">
                  <div className="message-bubble">{message.text}</div>
                  <div className="message-meta">{message.time} {message.sender === "agent" && <CheckCheck size={13} />}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <span>QUICK ACTIONS</span>
            <button onClick={() => onQuickReply("tracking")}><Truck size={14} /> Track order</button>
            <button onClick={() => onQuickReply("return")}><ArrowDownLeft size={14} /> Start a return</button>
            <button onClick={() => onQuickReply("human")}><Headphones size={14} /> Human support</button>
          </div>

          <form className="message-composer" onSubmit={(event) => { event.preventDefault(); onSend(); }}>
            <button type="button" className="icon-button composer-emoji" title="Insert a smile" onClick={() => setDraft(`${draft} 😊`)}><Smile size={19} /></button>
            <textarea aria-label="Type a message" placeholder="Write a message..." value={draft} rows={1} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} />
            <span className="composer-hint">Enter to send</span>
            <button type="submit" className="send-button" aria-label="Send message" disabled={!draft.trim()}><Send size={17} /></button>
          </form>
          <div className="composer-disclaimer"><ShieldCheck size={13} /> Customer conversations are private and secure.</div>
        </section>

        {showDetails && (
          <aside className="customer-details">
            <div className="details-title"><h3>Customer details</h3><button className="icon-button small-icon" onClick={() => setShowDetails(false)} aria-label="Close customer details"><X size={16} /></button></div>
            <div className="customer-profile-block"><Avatar initials={selectedChat.initials} color={selectedChat.color} large /><h3>{selectedChat.name}</h3><span className="customer-type">Returning customer</span><div className="customer-contact">customer@example.com</div></div>
            <div className="details-section"><div className="details-section-title">CUSTOMER OVERVIEW</div><div className="detail-stat-row"><span>Total orders</span><strong>4</strong></div><div className="detail-stat-row"><span>Total spent</span><strong>₹8,496</strong></div><div className="detail-stat-row"><span>Customer since</span><strong>Aug 2026</strong></div></div>
            <div className="details-section"><div className="details-section-title">RECENT ORDER</div><div className="recent-order-card"><div className="recent-order-art">🎧</div><div><strong>Studio Wireless Headphones</strong><span>Order #SE-24081</span><b>₹2,499</b></div></div><StatusBadge status="In transit" /><div className="delivery-line"><span /><div><b>Estimated delivery</b><small>Tomorrow, Nov 4</small></div></div></div>
            <div className="details-section"><div className="details-section-title">SUPPORT</div><div className="support-health"><span className="support-health-icon"><CircleHelp size={17} /></span><div><b>Support history</b><small>2 previous conversations</small></div><ChevronRight size={15} /></div><div className="support-health"><span className="support-health-icon"><ShieldCheck size={17} /></span><div><b>Customer status</b><small>Verified account</small></div><Check size={15} /></div></div>
            <button className="secondary-button full-button" onClick={() => onQuickReply("human")}><Headphones size={15} /> Escalate conversation</button>
          </aside>
        )}
      </div>
    </>
  );
}

function CustomersPage({
  chats,
  onOpenChat,
}: {
  chats: Chat[];
  onOpenChat: (id: number) => void;
}) {
  return (
    <>
      <PageHeading eyebrow="CUSTOMER RELATIONSHIPS" title="Customers" description="Get to know the people behind every order." />
      <div className="catalog-summary">
        <div><span className="summary-label">Total customers</span><strong>864</strong><small>Across your store</small></div>
        <div><span className="summary-label">Returning</span><strong>62%</strong><small>Repeat customers</small></div>
        <div><span className="summary-label">New this month</span><strong>128</strong><small>Recently joined</small></div>
        <div><span className="summary-label">Support needed</span><strong>{chats.filter((chat) => chat.unread > 0).length}</strong><small>Unread conversations</small></div>
      </div>
      <section className="panel customers-panel">
        <div className="panel-heading"><div><h3>Recent customers</h3><p>Open a customer conversation to help them.</p></div></div>
        <div className="customer-directory">
          {chats.map((chat, index) => (
            <div className="customer-directory-row" key={chat.id}>
              <Avatar initials={chat.initials} color={chat.color} large />
              <div className="directory-main"><strong>{chat.name}</strong><span>{chat.name.toLowerCase().replace(" ", ".")}@example.com</span></div>
              <div className="directory-order"><small>Recent enquiry</small><strong>{chat.subject}</strong></div>
              <div className="directory-spend"><small>Customer value</small><strong>{money([8496, 12499, 5398, 3198, 2799][index % 5])}</strong></div>
              <button className="secondary-button" onClick={() => onOpenChat(chat.id)}><MessageCircle size={15} /> Contact</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SettingsPage({
  theme,
  onToggleTheme,
  onNotify,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  onNotify: (message: string) => void;
}) {
  return (
    <>
      <PageHeading eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Personalize how you work with ShopEase." />
      <section className="panel settings-panel">
        <div className="settings-section">
          <div className="settings-icon"><Sun size={19} /></div>
          <div className="settings-copy"><h3>Appearance</h3><p>Choose the visual theme for your workspace.</p></div>
          <div className="theme-choice">
            <button className={theme === "light" ? "theme-choice-active" : ""} onClick={() => { if (theme !== "light") onToggleTheme(); }}><Sun size={16} /> Forest light</button>
            <button className={theme === "dark" ? "theme-choice-active" : ""} onClick={() => { if (theme !== "dark") onToggleTheme(); }}><Moon size={16} /> Premium gold</button>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-icon"><Bell size={19} /></div>
          <div className="settings-copy"><h3>Notifications</h3><p>Receive updates for orders and customer messages.</p></div>
          <button className="secondary-button" onClick={() => onNotify("Notification preferences are ready for API integration.")}>Manage notifications</button>
        </div>
        <div className="settings-section">
          <div className="settings-icon"><ShieldCheck size={19} /></div>
          <div className="settings-copy"><h3>Account & security</h3><p>Authentication and session settings will use your existing backend.</p></div>
          <button className="secondary-button" onClick={() => onNotify("Your existing authentication flow has not been changed.")}>View security</button>
        </div>
        <div className="settings-section">
          <div className="settings-icon"><Zap size={19} /></div>
          <div className="settings-copy"><h3>AI Support</h3><p>AI responses and product-aware answers will be connected to the server in the next stage.</p></div>
          <span className="status-badge processing">Integration pending</span>
        </div>
      </section>
    </>
  );
}

export default App;

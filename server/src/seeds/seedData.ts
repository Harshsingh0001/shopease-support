import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import KnowledgeArticle from "../models/KnowledgeArticle.js";

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log("🌱 Cleaning existing collections...");
    await Promise.all([
      User.deleteMany({ email: { $in: [
        "admin@shopease.local",
        "supervisor@shopease.local",
        "agent@shopease.local",
        "customer@shopease.local",
        "customer2@shopease.local",
      ] } }),
      Product.deleteMany({ sku: { $in: ["PRD-001", "PRD-002", "PRD-003", "PRD-004", "PRD-005", "PRD-006"] } }),
      Order.deleteMany({ orderNumber: { $in: ["ORD-1001", "ORD-1002", "ORD-1003", "ORD-2001"] } }),
      KnowledgeArticle.deleteMany({}),
    ]);

    console.log("👤 Creating demo users...");
    const defaultPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [admin, supervisor, agent, customer1, customer2] = await User.create([
      {
        name: "Vikram Mehta",
        email: "admin@shopease.local",
        password: hashedPassword,
        role: "admin",
        preferredLanguage: "en",
        status: "active",
        isVerified: true,
      },
      {
        name: "Aditi Verma",
        email: "supervisor@shopease.local",
        password: hashedPassword,
        role: "supervisor",
        preferredLanguage: "en",
        status: "active",
        isVerified: true,
      },
      {
        name: "Priya Sharma",
        email: "agent@shopease.local",
        password: hashedPassword,
        role: "agent",
        preferredLanguage: "en",
        status: "active",
        isVerified: true,
      },
      {
        name: "Aman Gupta",
        email: "customer@shopease.local",
        phone: "+919876543210",
        password: hashedPassword,
        role: "customer",
        preferredLanguage: "en",
        status: "active",
        isVerified: true,
      },
      {
        name: "Rohit Kumar",
        email: "customer2@shopease.local",
        phone: "+919123456789",
        password: hashedPassword,
        role: "customer",
        preferredLanguage: "hi",
        status: "active",
        isVerified: true,
      },
    ]);

    console.log("📦 Creating demo products...");
    const products = await Product.create([
      {
        sku: "PRD-001",
        name: "Studio Wireless Headphones",
        category: "Electronics",
        price: 2499,
        stock: 42,
        rating: 4.8,
        description: "Over-ear noise-cancelling wireless Bluetooth headphones with 30-hour battery life and fast USB-C charging.",
      },
      {
        sku: "PRD-002",
        name: "Everyday Smart Watch",
        category: "Wearables",
        price: 3999,
        stock: 28,
        rating: 4.6,
        description: "Sleek fitness tracking smartwatch with AMOLED display, heart rate monitor, and 7-day battery life.",
      },
      {
        sku: "PRD-003",
        name: "Ergonomic Running Shoes",
        category: "Footwear",
        price: 2199,
        stock: 65,
        rating: 4.7,
        description: "Lightweight and breathable athletic running shoes with responsive foam cushioning for everyday comfort.",
      },
      {
        sku: "PRD-004",
        name: "Classic Denim Jacket",
        category: "Apparel",
        price: 1899,
        stock: 19,
        rating: 4.5,
        description: "Timeless vintage wash denim jacket made from 100% durable cotton with button closure.",
      },
      {
        sku: "PRD-005",
        name: "Waterproof Laptop Backpack",
        category: "Accessories",
        price: 1499,
        stock: 54,
        rating: 4.9,
        description: "Weather-resistant 25L daily commuter backpack with dedicated padded sleeve for up to 16-inch laptops.",
      },
      {
        sku: "PRD-006",
        name: "Mechanical Gaming Keyboard",
        category: "Electronics",
        price: 4299,
        stock: 15,
        rating: 4.8,
        description: "Tenkeyless mechanical keyboard with customizable RGB backlighting and durable tactile blue switches.",
      },
    ]);

    console.log("🛒 Creating demo orders...");
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await Order.create([
      {
        orderNumber: "ORD-1001",
        customerId: customer1._id,
        items: [
          {
            productId: products[0]._id,
            name: products[0].name,
            price: products[0].price,
            quantity: 1,
          },
        ],
        totalAmount: 2499,
        status: "shipped",
        placedAt: twoDaysAgo,
        estimatedDelivery: twoDaysFromNow,
        carrier: "Delhivery",
        trackingNumber: "DL789456123IN",
        shippingAddress: {
          street: "Flat 402, Sunshine Apartments, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
        },
      },
      {
        orderNumber: "ORD-1002",
        customerId: customer1._id,
        items: [
          {
            productId: products[1]._id,
            name: products[1].name,
            price: products[1].price,
            quantity: 1,
          },
        ],
        totalAmount: 3999,
        status: "delivered",
        placedAt: tenDaysAgo,
        estimatedDelivery: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        carrier: "BlueDart",
        trackingNumber: "BD123456789IN",
        shippingAddress: {
          street: "Flat 402, Sunshine Apartments, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
        },
      },
      {
        orderNumber: "ORD-1003",
        customerId: customer1._id,
        items: [
          {
            productId: products[4]._id,
            name: products[4].name,
            price: products[4].price,
            quantity: 2,
          },
        ],
        totalAmount: 2998,
        status: "processing",
        placedAt: now,
        shippingAddress: {
          street: "Flat 402, Sunshine Apartments, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
        },
      },
      {
        orderNumber: "ORD-2001",
        customerId: customer2._id,
        items: [
          {
            productId: products[2]._id,
            name: products[2].name,
            price: products[2].price,
            quantity: 1,
          },
        ],
        totalAmount: 2199,
        status: "shipped",
        placedAt: twoDaysAgo,
        estimatedDelivery: twoDaysFromNow,
        carrier: "DTDC",
        trackingNumber: "DT987654321IN",
        shippingAddress: {
          street: "C-12, Sector 14",
          city: "New Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "India",
        },
      },
    ]);

    console.log("📚 Creating knowledge base articles...");
    await KnowledgeArticle.create([
      {
        title: "Shipping & Delivery Policy",
        slug: "shipping-and-delivery-policy",
        category: "shipping",
        tags: ["shipping", "delivery", "delhivery", "timeline"],
        language: "en",
        published: true,
        authorId: admin._id,
        body: `ShopEase delivers across all major Indian pin codes.
1. Metro Cities: Orders typically arrive within 2-3 business days.
2. Non-Metro Cities: Orders arrive within 4-6 business days.
3. Tracking: Once your parcel is dispatched, a tracking ID (Delhivery/BlueDart/DTDC) is attached to your order details.
4. Shipping Fees: Standard shipping is free on all orders above ₹999. A nominal fee of ₹49 applies below ₹999.`,
      },
      {
        title: "Return and Replacement Guidelines",
        slug: "return-and-replacement-guidelines",
        category: "returns",
        tags: ["return", "replacement", "exchange", "damage"],
        language: "en",
        published: true,
        authorId: admin._id,
        body: `We offer a 7-day hassle-free return and replacement policy.
1. Eligibility: Products can be returned within 7 days of delivery.
2. Condition: Items must be unused, in original packaging, with tags intact.
3. Damaged or Defective Items: Must be reported within 48 hours of delivery with photos through the support chat.
4. Pickup: Our courier partner will pick up the package from your address within 2 business days of return request approval.`,
      },
      {
        title: "Refund Policy and Timelines",
        slug: "refund-policy-and-timelines",
        category: "refunds",
        tags: ["refund", "upi", "card", "bank-transfer"],
        language: "en",
        published: true,
        authorId: admin._id,
        body: `Refunds are initiated immediately upon warehouse quality check completion (usually 24-48 hours after pickup).
1. UPI / Net Banking: Credited back within 3-5 business days.
2. Credit / Debit Cards: Credited back within 5-7 business days depending on your bank.
3. Cash on Delivery (COD): Refund is credited to the customer's provided UPI ID or bank account details.`,
      },
      {
        title: "Warranty & Repair Coverage",
        slug: "warranty-and-repair-coverage",
        category: "warranty",
        tags: ["warranty", "repair", "guarantee", "electronics"],
        language: "en",
        published: true,
        authorId: admin._id,
        body: `All electronics (smartwatches, headphones, keyboards) sold on ShopEase include a 1-year brand warranty.
1. What is covered: Manufacturing defects, battery failure, charging port issues.
2. What is not covered: Physical damage, water damage (unless IPX certified), unauthorized repairs.
3. Claim Process: Contact support with your order number to obtain an authorized service ticket.`,
      },
      {
        title: "Order Return and Cancellation FAQ (Hinglish)",
        slug: "hinglish-order-and-return-faq",
        category: "general",
        tags: ["hinglish", "return", "cancel", "faq"],
        language: "hinglish",
        published: true,
        authorId: admin._id,
        body: `ShopEase support FAQs in Hinglish:
1. Mera order kab tak deliver hoga?
Metro cities mein delivery 2-3 din mein hoti hai, aur baaki jagah 4-6 din lagte hain. Aap apne order details mein tracking ID dekh sakte hain.
2. Kya main item return kar sakta hoon?
Haan, delivery ke 7 din ke andar aap return request raise kar sakte hain. Item unused hona chahiye aur original box hona zaroori hai.
3. Refund kitne din mein milega?
Return pickup hone aur check hone ke baad refund 3 se 7 business days mein aapke original payment account mein aa jata hai.
4. Order cancel kaise karein?
Agar order abhi tak dispatch nahi hua hai (status: processing ya pending), toh aap support se bol kar turant cancel kar sakte hain.`,
      },
      {
        title: "Draft: Internal Staff Refund Exception Rules",
        slug: "draft-internal-staff-refund-exception-rules",
        category: "refunds",
        tags: ["internal", "staff-only", "draft"],
        language: "en",
        published: false, // CRITICAL: UNPUBLISHED DRAFT!
        authorId: admin._id,
        body: `INTERNAL STAFF ONLY: Rules for approving goodwill refunds without return pickup for VIP accounts or high courier loss incidents. Not for customer distribution.`,
      },
    ]);

    console.log("✨ Seed completed successfully!");
    console.log("------------------------------------------");
    console.log("DEMO CREDENTIALS (password: Password123!)");
    console.log("Admin:    admin@shopease.local");
    console.log("Agent:    agent@shopease.local");
    console.log("Customer: customer@shopease.local (Orders: ORD-1001, ORD-1002, ORD-1003)");
    console.log("Customer: customer2@shopease.local (Order: ORD-2001)");
    console.log("Knowledge: 5 Published Articles + 1 Unpublished Draft");
    console.log("------------------------------------------");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

if (process.argv[1]?.includes("seedData")) {
  seedDatabase().then(() => process.exit(0));
}

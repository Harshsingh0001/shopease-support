import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log("🌱 Cleaning existing collections...");
    await Promise.all([
      User.deleteMany({ email: { $in: [
        "admin@shopease.local",
        "agent@shopease.local",
        "customer@shopease.local",
        "customer2@shopease.local",
      ] } }),
      Product.deleteMany({ sku: { $in: ["PRD-001", "PRD-002", "PRD-003", "PRD-004", "PRD-005", "PRD-006"] } }),
      Order.deleteMany({ orderNumber: { $in: ["ORD-1001", "ORD-1002", "ORD-1003", "ORD-2001"] } }),
    ]);

    console.log("👤 Creating demo users...");
    const defaultPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [admin, agent, customer1, customer2] = await User.create([
      {
        name: "Aditi Verma",
        email: "admin@shopease.local",
        password: hashedPassword,
        role: "admin",
        preferredLanguage: "en",
        status: "active",
        isVerified: true,
      },
      {
        name: "Rahul Sharma",
        email: "agent@shopease.local",
        password: hashedPassword,
        role: "agent",
        preferredLanguage: "hi",
        status: "active",
        isVerified: true,
      },
      {
        name: "Aman Gupta",
        email: "customer@shopease.local",
        password: hashedPassword,
        role: "customer",
        preferredLanguage: "hinglish",
        status: "active",
        isVerified: true,
      },
      {
        name: "Rohit Mehra",
        email: "customer2@shopease.local",
        password: hashedPassword,
        role: "customer",
        preferredLanguage: "en",
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

    console.log("✨ Seed completed successfully!");
    console.log("------------------------------------------");
    console.log("DEMO CREDENTIALS (password: Password123!)");
    console.log("Admin:    admin@shopease.local");
    console.log("Agent:    agent@shopease.local");
    console.log("Customer: customer@shopease.local (Orders: ORD-1001, ORD-1002, ORD-1003)");
    console.log("Customer: customer2@shopease.local (Order: ORD-2001)");
    console.log("------------------------------------------");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

if (process.argv[1]?.includes("seedData")) {
  seedDatabase().then(() => process.exit(0));
}

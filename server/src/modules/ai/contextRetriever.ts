import mongoose from "mongoose";
import User from "../../models/User.js";
import Order from "../../models/Order.js";
import KnowledgeArticle from "../../models/KnowledgeArticle.js";
import type { CustomerIntent, GroundingContext } from "./aiTypes.js";

interface RetrieveContextParams {
  customerId: string;
  intent: CustomerIntent;
  extractedOrderNumber?: string;
  queryText: string;
}

/**
 * Retrieve verified, authorized data to ground the AI response
 */
export const retrieveGroundingContext = async ({
  customerId,
  intent,
  extractedOrderNumber,
  queryText,
}: RetrieveContextParams): Promise<GroundingContext> => {
  // 1. Fetch Customer Profile
  const user = await User.findById(customerId).select("name preferredLanguage");
  const customerName = user?.name || "Valued Customer";
  const preferredLanguage = user?.preferredLanguage || "en";

  let orderData: GroundingContext["orderData"] = undefined;
  let recentOrders: GroundingContext["recentOrders"] = undefined;

  // 2. Fetch Order Details if an order number was explicitly mentioned
  if (extractedOrderNumber) {
    const order = await Order.findOne({
      orderNumber: extractedOrderNumber.toUpperCase(),
    }).lean();

    if (order) {
      // STRICT IDOR CHECK: Only ground with the order if it actually belongs to this customer!
      if (order.customerId.toString() === customerId) {
        orderData = {
          orderNumber: order.orderNumber,
          status: order.status,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery
            ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : undefined,
          items: order.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingAddress: {
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
          },
        };
      } else {
        console.warn(
          `[SECURITY] Customer ${customerId} attempted AI query for order ${extractedOrderNumber} owned by someone else.`
        );
      }
    }
  }

  // 3. If tracking intent and no specific order given, fetch active/recent orders
  if (intent === "order_tracking" && !orderData) {
    const orders = await Order.find({ customerId })
      .sort({ placedAt: -1 })
      .limit(3)
      .lean();

    if (orders.length > 0) {
      recentOrders = orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        placedAt: new Date(o.placedAt).toLocaleDateString("en-IN"),
        totalAmount: o.totalAmount,
      }));
    }
  }

  // 4. Retrieve Relevant Published Knowledge Base Articles
  const categoryMap: Partial<Record<CustomerIntent, string>> = {
    order_tracking: "shipping",
    return_request: "returns",
    refund_inquiry: "refunds",
    product_question: "warranty",
  };

  const targetCategory = categoryMap[intent];
  const policyFilter: Record<string, unknown> = { published: true };

  if (targetCategory) {
    policyFilter.category = targetCategory;
  } else {
    // Keyword search in published articles
    policyFilter.$or = [
      { title: { $regex: queryText.split(" ")[0] || "return", $options: "i" } },
      { body: { $regex: queryText.split(" ")[0] || "shipping", $options: "i" } },
    ];
  }

  const articles = await KnowledgeArticle.find(policyFilter)
    .limit(3)
    .select("title category body")
    .lean();

  const relevantPolicies = articles.map((a) => ({
    title: a.title,
    category: a.category,
    body: a.body,
  }));

  return {
    customerName,
    preferredLanguage,
    orderData,
    recentOrders,
    relevantPolicies,
  };
};

import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  Tag,
  CreditCard,
  MapPin,
  Check,
  Zap,
} from "lucide-react";
import type { CartItem, Order } from "../../types";
import { api } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { getProductEnhancement } from "../../utils/productData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
  onOpenAiChatWithOrder?: (orderNumber: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onOpenAiChatWithOrder,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [step, setStep] = useState<"cart" | "checkout" | "confirmed">("cart");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Promo code state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; flat?: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Address and Payment selection
  const [shippingAddress, setShippingAddress] = useState({
    street: "402 Greenfield Residency, 14th Main, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560102",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent) {
      discountAmount = Math.round((subtotal * appliedDiscount.percent) / 100);
    } else if (appliedDiscount.flat) {
      discountAmount = Math.min(subtotal, appliedDiscount.flat);
    }
  }

  const baseShipping = subtotal >= freeShippingThreshold || subtotal === 0 || appliedDiscount?.code === "FREESHIP" ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + baseShipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === "WELCOME10") {
      setAppliedDiscount({ code: "WELCOME10", percent: 10 });
    } else if (code === "SAVE500" && subtotal >= 2000) {
      setAppliedDiscount({ code: "SAVE500", flat: 500 });
    } else if (code === "FREESHIP") {
      setAppliedDiscount({ code: "FREESHIP", flat: 99 });
    } else {
      setCouponError("Invalid or expired code. Try 'WELCOME10' for 10% off!");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const itemsPayload = cart.map((i) => ({
        productId: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const res = await api.orders.create({
        items: itemsPayload,
        shippingAddress,
      });

      setCreatedOrder(res.order);
      setStep("confirmed");
      onOrderCreated(res.order);
      onClearCart();
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-3 sm:pl-10">
        <div
          className={`w-screen max-w-full sm:max-w-md border-l flex flex-col shadow-2xl transition ${t.card} ${t.divider}`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${t.divider}`}>
            <div className="flex items-center gap-2">
              <ShoppingBag className={`w-5 h-5 ${t.accentText}`} />
              <h2 className="font-black text-base tracking-tight">
                {step === "confirmed" ? "Order Receipt" : step === "checkout" ? "Express Checkout" : "Shopping Cart"}
              </h2>
              {step === "cart" && (
                <span className="text-xs opacity-60">({cart.length} items)</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl opacity-70 hover:opacity-100 hover:bg-current/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {step === "confirmed" && createdOrder ? (
              /* Instant Order Confirmation Screen */
              <div className="p-4 sm:p-6 text-center space-y-4 my-auto">
                <div
                  className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
                    t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"
                  }`}
                >
                  <CheckCircle className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-xl font-black">Order Placed Successfully!</h3>
                  <p className="text-xs opacity-75 mt-1">
                    Your order has been recorded into the live database & fulfillment queue.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-left space-y-2.5 text-xs ${t.cardMuted} ${t.divider}`}>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Order Number:</span>
                    <strong className={`font-mono text-sm font-black ${t.accentText}`}>
                      {createdOrder.orderNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Amount Paid:</span>
                    <strong className="font-extrabold text-sm">
                      ₹{createdOrder.totalAmount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.badgeHighlight}`}>
                      {createdOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Carrier Partner:</span>
                    <span className="font-semibold text-emerald-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{createdOrder.carrier || "Delhivery Express"}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Tracking AWB:</span>
                    <span className="font-mono text-[11px] opacity-90">
                      {createdOrder.trackingNumber || "Pending Dispatch"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {onOpenAiChatWithOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAiChatWithOrder(createdOrder.orderNumber);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xl ${t.primaryButton}`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Track this Order with AI Assistant</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setStep("cart");
                      setCreatedOrder(null);
                      onClose();
                    }}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold border ${t.secondaryButton}`}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : step === "checkout" ? (
              /* Checkout Form Step */
              <div className="space-y-4 text-xs">
                {/* Delivery Address */}
                <div className={`p-4 rounded-2xl border space-y-3 ${t.cardMuted} ${t.divider}`}>
                  <div className="font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Shipping Address</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="Street address"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="City"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                      />
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        placeholder="PIN Code"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className={`p-4 rounded-2xl border space-y-3 ${t.cardMuted} ${t.divider}`}>
                  <div className="font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Payment Method</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "upi", label: "UPI / QR" },
                      { id: "card", label: "Cards" },
                      { id: "cod", label: "Cash on Delivery" },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border font-bold text-center transition ${
                          paymentMethod === pm.id
                            ? t.isDark
                              ? "bg-[#382f1c] text-[#f5e7bf] border-[#d9a83e]"
                              : "bg-[#e6f4ea] text-[#059669] border-[#059669]"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs opacity-70 hover:underline"
                >
                  &larr; Back to cart review
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Cart State */
              <div className="text-center py-16 opacity-60 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                <div>
                  <div className="font-black text-sm">Your cart is empty</div>
                  <p className="text-xs mt-1">Browse our electronics catalogue and add items to your cart.</p>
                </div>
              </div>
            ) : (
              /* Items List */
              <div className="space-y-3">
                {/* Free Shipping Progress Bar */}
                <div className={`p-3 rounded-2xl border space-y-1.5 ${t.cardMuted} ${t.divider}`}>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-500" />
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-emerald-500">Unlocked FREE Express Delivery!</span>
                      ) : (
                        <span>Add ₹{(freeShippingThreshold - subtotal).toLocaleString("en-IN")} more for FREE Delivery</span>
                      )}
                    </span>
                    <span className="opacity-60">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-current/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                {cart.map((item) => {
                  const enhancement = getProductEnhancement(item.product.sku);
                  const imageUrl = item.product.image || enhancement.image;

                  return (
                    <div
                      key={item.product._id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${t.cardMuted} ${t.divider}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-current/10"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs truncate">{item.product.name}</h4>
                          <div className="text-[11px] font-bold opacity-80">
                            ₹{item.product.price.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] opacity-50 uppercase font-mono">
                            {item.product.sku}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-xl p-0.5 border-current/20">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                            className="p-1 hover:bg-current/10 rounded-lg transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-2">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 hover:bg-current/10 rounded-lg transition disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product._id)}
                          className="p-1.5 opacity-50 hover:opacity-100 hover:text-rose-500 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} className="pt-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code (e.g. WELCOME10)"
                        className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none uppercase ${t.input}`}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${t.secondaryButton}`}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscount && (
                    <div className="text-[11px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Coupon {appliedDiscount.code} applied! (-₹{discountAmount})</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[11px] text-rose-500 mt-1">{couponError}</div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action Bar */}
          {step !== "confirmed" && cart.length > 0 && (
            <div className={`p-4 border-t space-y-3 shrink-0 ${t.divider} ${t.cardMuted}`}>
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between opacity-80">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Discount ({appliedDiscount?.code})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between opacity-80">
                  <span>Shipping</span>
                  <span>{baseShipping === 0 ? "FREE" : `₹${baseShipping}`}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1.5 border-t border-current/10">
                  <span>Total Amount</span>
                  <span className={t.accentText}>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-2 text-[11px] bg-rose-500/20 text-rose-400 rounded-lg">
                  {checkoutError}
                </div>
              )}

              {/* Action Buttons */}
              {step === "cart" ? (
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition ${t.primaryButton}`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition disabled:opacity-50 ${t.primaryButton}`}
                >
                  <span>{checkoutLoading ? "Placing Order in MongoDB..." : `Confirm & Pay ₹${total.toLocaleString("en-IN")}`}</span>
                  <Check className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] opacity-60">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Grounded Orders • Instant AI Tracking Enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

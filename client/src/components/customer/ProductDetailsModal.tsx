import React, { useState } from "react";
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import type { Product } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { getProductEnhancement } from "../../utils/productData";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onAskAi: (prompt: string, product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onAskAi,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "ai_qa">("overview");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  if (!product) return null;

  const enhancement = getProductEnhancement(product.sku);
  const gallery = enhancement.gallery;
  const currentImage = gallery[selectedImageIndex] || enhancement.image;
  const originalPrice = product.originalPrice || enhancement.originalPrice;
  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );

  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setPincodeStatus(`Eligible for Free 2-Day Express Delivery to ${pincode}! (Cash on Delivery Available)`);
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  const sampleAiQuestions = [
    `Can I return this ${product.name} within 7 days if defective or unboxed?`,
    `Does the ${product.name} come with official 1-year brand warranty?`,
    `Is ${product.name} (SKU: ${product.sku}) in stock for immediate dispatch?`,
    `What are the delivery timelines for ${product.name} via Delhivery?`,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[92vh] ${t.card}`}
      >
        {/* Top Header Bar */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${t.divider}`}>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                t.isDark
                  ? "bg-[#d9a83e] text-[#17140d]"
                  : "bg-[#059669] text-white"
              }`}
            >
              {enhancement.badge || product.category}
            </span>
            <span className="text-xs font-mono opacity-60">• SKU: {product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl opacity-70 hover:opacity-100 hover:bg-current/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Gallery Visual Frame */}
            <div className="space-y-3">
              <div
                className={`h-72 sm:h-96 rounded-2xl flex items-center justify-center relative overflow-hidden border ${
                  t.isDark
                    ? "bg-[#141412] border-[#353229]"
                    : "bg-[#f4f7f4] border-[#e2e8e2]"
                }`}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnail strip */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        selectedImageIndex === idx
                          ? t.isDark ? "border-[#d9a83e]" : "border-[#059669]"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating || 4.8)
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold">{product.rating || "4.8"}</span>
                  <span className="text-xs opacity-50">
                    ({enhancement.reviewsCount} customer reviews)
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black leading-tight mb-2">
                  {product.name}
                </h2>

                <p className="text-xs opacity-75 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Row */}
              <div className={`p-4 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-black ${t.accentText}`}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {originalPrice > product.price && (
                      <span className="text-sm line-through opacity-50">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500">
                    Inclusive of all taxes
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  EMI starts from ₹{Math.round(product.price / 6).toLocaleString("en-IN")}/mo. Standard shipping free over ₹1,999.
                </div>
              </div>

              {/* PIN Code Delivery Checker */}
              <form onSubmit={checkPincode} className="space-y-1.5">
                <label className="text-[11px] font-bold opacity-80 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Check Delivery & Cash on Delivery Availability</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit PIN (e.g. 560001)"
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none ${t.input}`}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 text-xs font-bold rounded-xl border ${t.secondaryButton}`}
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus && (
                  <div
                    className={`text-[11px] font-semibold mt-1 ${
                      pincodeStatus.includes("Eligible") ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {pincodeStatus}
                  </div>
                )}
              </form>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold opacity-80">Select Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className={`p-1.5 rounded-xl border transition disabled:opacity-40 ${t.secondaryButton}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-sm w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className={`p-1.5 rounded-xl border transition disabled:opacity-40 ${t.secondaryButton}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                  }}
                  disabled={product.stock <= 0}
                  className={`py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border transition active:scale-95 ${t.secondaryButton}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  disabled={product.stock <= 0}
                  className={`py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xl transition active:scale-95 ${t.primaryButton}`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Assurances Pill Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] opacity-80">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>2-Day Express</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>7-Day Return</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>1-Yr Warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Tabs: Overview, Specs, AI Grounded Q&A */}
          <div className="border-t border-current/10 pt-5 space-y-4">
            <div className="flex gap-2 border-b border-current/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  activeTab === "overview" ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                Key Features
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  activeTab === "specs" ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                Tech Specs
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ai_qa")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                  activeTab === "ai_qa"
                    ? t.isDark
                      ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/50"
                      : "bg-[#e6f4ea] text-[#059669] border border-[#a7f3d0]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About This Product</span>
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {enhancement.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${t.cardMuted} ${t.divider}`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="opacity-90">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Specs */}
            {activeTab === "specs" && (
              <div className="rounded-2xl border overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody>
                    {Object.entries(enhancement.specs).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={`border-b ${t.divider} ${idx % 2 === 0 ? t.cardMuted : ""}`}
                      >
                        <td className="p-3 font-bold opacity-75 w-1/3">{key}</td>
                        <td className="p-3 font-semibold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Grounded AI Q&A */}
            {activeTab === "ai_qa" && (
              <div className="space-y-3">
                <div className="text-xs opacity-75">
                  Click any question below to test the ShopEase AI Grounded Assistant. Answers are verified in real time against our MongoDB database and official policy knowledge base:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sampleAiQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onAskAi(q, product);
                        onClose();
                      }}
                      className={`text-left p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between transition hover:scale-[1.01] active:scale-[0.99] ${
                        t.isDark
                          ? "bg-[#24221c] hover:bg-[#2e2b23] border-[#353229] text-[#f5e7bf]"
                          : "bg-[#9CABB4] hover:bg-[#8ca0ab] border-[#8396a1] text-[#141c22]"
                      }`}
                    >
                      <span className="line-clamp-2">{q}</span>
                      <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-60 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Truck,
  Sparkles,
  Package,
  ShieldCheck,
  Award,
  FileText,
  Clock,
  Flame,
  Headphones,
  Watch,
  Footprints,
  Shirt,
  Briefcase,
  Layers,
  LayoutDashboard,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { Order, Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { ProductCard } from "./ProductCard";
import type { CustomerViewType } from "./CustomerNavbar";
import { getProductEnhancement } from "../../utils/productData";

interface CustomerHomeViewProps {
  orders: Order[];
  products: Product[];
  onNavigateToView: (view: CustomerViewType) => void;
  onOpenProductDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskAi: (query: string) => void;
  cartProductIds: string[];
  onSelectCategory?: (category: string) => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  orders: _orders,
  products,
  onNavigateToView,
  onOpenProductDetails,
  onAddToCart,
  onAskAi,
  cartProductIds,
  onSelectCategory,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  // Live Deal of the Day Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Visual Category Department Navigation Cards
  const visualCategories = [
    { id: "all", label: "All Items", icon: Layers, tag: `${products.length} Products` },
    { id: "electronics", label: "Audio & ANC", icon: Headphones, tag: "Up to 36% Off" },
    { id: "wearables", label: "Smartwatches", icon: Watch, tag: "Top Rated" },
    { id: "footwear", label: "Footwear", icon: Footprints, tag: "Trending" },
    { id: "apparel", label: "Denim & Apparel", icon: Shirt, tag: "Best Sellers" },
    { id: "accessories", label: "Bags & Gear", icon: Briefcase, tag: "Waterproof" },
  ];

  // Trust Badges
  const trustBadges = [
    {
      title: "7-Day Replacement",
      desc: "Doorstep pickup & exchange",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    {
      title: "Express Shipping",
      desc: "Free Delhivery on orders ₹999+",
      icon: Truck,
      color: "text-blue-500",
    },
    {
      title: "1-Year Warranty",
      desc: "100% genuine brand guarantee",
      icon: Award,
      color: "text-amber-500",
    },
    {
      title: "GST Tax Invoice",
      desc: "Input tax credit compliant",
      icon: FileText,
      color: "text-purple-500",
    },
  ];

  const dealProduct = products[0]; // Featured deal product
  const bestSellers = products.slice(0, 4); // Top 4 curated products for clean frontpage

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    onNavigateToView("products");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Clean Welcome & Fast Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-current/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome back, <span className={t.accentText}>{user?.name?.split(" ")[0] || "Customer"}</span> 👋
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Discover verified gadgets, track carrier deliveries, or resolve issues with grounded AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToView("dashboard")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition active:scale-95 ${t.secondaryButton}`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 ${t.isDark ? "text-amber-400" : "text-[#AB644B]"}`} />
            <span>My Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView("assistant")}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition active:scale-95 ${t.primaryButton}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Category Department Navigation Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider opacity-70">
          <span>Explore Departments</span>
          <button
            type="button"
            onClick={() => onNavigateToView("products")}
            className={`text-xs font-bold hover:underline flex items-center gap-1 ${t.accentText}`}
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {visualCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                aria-label={`Filter by department: ${cat.label}`}
                className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between gap-2 hover:-translate-y-0.5 hover:shadow-md ${t.cardMuted} ${t.divider}`}
              >
                <div className="p-2.5 rounded-xl bg-current/5">
                  <Icon className={`w-5 h-5 ${t.isDark ? "text-amber-400" : "text-[#AB644B]"}`} />
                </div>
                <div>
                  <div className="font-extrabold text-xs">{cat.label}</div>
                  <div className="text-[10px] font-semibold opacity-75 mt-0.5">{cat.tag}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Limited-Time Deal of the Day Banner with CLS-Protected Height */}
      {dealProduct ? (
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden min-h-[460px] lg:min-h-[280px] ${t.card}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>Deal of the Day</span>
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border border-rose-500/30 text-rose-500 bg-rose-500/10">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Ends in {String(timeLeft.hours).padStart(2, "0")}h:
                    {String(timeLeft.minutes).padStart(2, "0")}m:
                    {String(timeLeft.seconds).padStart(2, "0")}s
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{dealProduct.name}</h2>
                <p className="text-xs opacity-75 line-clamp-2 mt-1">
                  {dealProduct.description}
                </p>
              </div>

              {/* Price & Claim Progress */}
              <div className="flex flex-wrap items-baseline gap-3">
                <span className={`text-2xl font-black ${t.accentText}`}>
                  ₹{dealProduct.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs opacity-75 line-through">
                  ₹{(dealProduct.price + 1800).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Save 36% OFF
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 max-w-md">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-rose-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-rose-500" /> 78% Claimed
                  </span>
                  <span className="opacity-80">Only 6 units left at this price</span>
                </div>
                <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[78%] transition-all duration-500" />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onAddToCart(dealProduct)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition active:scale-95 ${t.primaryButton}`}
                >
                  <Package className="w-4 h-4" />
                  <span>{cartProductIds.includes(dealProduct._id) ? "Added to Cart" : "Claim Deal Now"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenProductDetails(dealProduct)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${t.secondaryButton}`}
                >
                  View Details & Specs
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskAi(
                      `Tell me about the Deal of the Day: ${dealProduct.name}. What are the top features, warranty coverage, and return policy?`
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${t.accentText}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI about this Deal</span>
                </button>
              </div>
            </div>

            {/* Deal Image Frame: Fast LCP with explicit dimensions and high priority */}
            <button
              type="button"
              onClick={() => onOpenProductDetails(dealProduct)}
              aria-label={`View details and specifications for ${dealProduct.name}`}
              className="w-full sm:w-64 h-52 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shrink-0 border relative group shadow-md aspect-[4/3] bg-neutral-900 text-left focus:outline-none focus:ring-2 focus:ring-[#AB644B]"
            >
              <img
                src={getProductEnhancement(dealProduct.sku).image.replace("w=800", "w=480").replace("q=80", "q=75")}
                alt={dealProduct.name}
                width="256"
                height="224"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                LIMITED DEAL
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden min-h-[460px] lg:min-h-[280px] animate-pulse flex flex-col lg:flex-row justify-between gap-6 ${t.card}`}>
          <div className="space-y-3 flex-1">
            <div className="w-32 h-6 rounded-full bg-current/10" />
            <div className="w-3/4 h-7 rounded-xl bg-current/10" />
            <div className="w-full h-4 rounded bg-current/10" />
            <div className="w-40 h-8 rounded-lg bg-current/10 mt-4" />
            <div className="w-full max-w-md h-3 rounded-full bg-current/10" />
            <div className="flex gap-2 pt-2">
              <div className="w-32 h-9 rounded-xl bg-current/10" />
              <div className="w-28 h-9 rounded-xl bg-current/10" />
            </div>
          </div>
          <div className="w-full sm:w-64 h-52 sm:h-56 rounded-2xl bg-current/10 shrink-0" />
        </div>
      )}

      {/* 4. Curated Best Sellers Showcase Strip (Clean 4 Cards Only) */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight">Best Sellers & Trending Gear</h2>
            <p className="text-xs opacity-75">
              Verified gadgets with 7-day replacement guarantee and official manufacturer warranty.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToView("products")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${t.secondaryButton}`}
          >
            <span>Explore Store Catalogue & Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.length > 0 ? (
            bestSellers.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onAddToCart={(p) => onAddToCart(p)}
                onOpenDetails={onOpenProductDetails}
                onAskAiAboutProduct={(p) =>
                  onAskAi(
                    `Tell me about ${p.name} (SKU: ${p.sku}) - price ₹${p.price}, stock availability, warranty and returns policy.`
                  )
                }
                isAdded={cartProductIds.includes(prod._id)}
              />
            ))
          ) : (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl p-4 flex flex-col justify-between border min-h-[440px] animate-pulse ${t.card}`}
              >
                <div>
                  <div className="h-56 rounded-2xl bg-current/10 mb-4" />
                  <div className="h-4 w-1/3 bg-current/10 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-current/10 rounded mb-2" />
                  <div className="h-3 w-full bg-current/10 rounded mb-1" />
                  <div className="h-3 w-2/3 bg-current/10 rounded" />
                </div>
                <div className="pt-3 border-t border-current/10">
                  <div className="h-6 w-1/2 bg-current/10 rounded mb-3" />
                  <div className="h-9 w-full bg-current/10 rounded-xl" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Trust & Quality Guarantees Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm ${t.cardMuted} ${t.divider}`}>
        {trustBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-current/5 ${badge.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs">{badge.title}</h3>
                <p className="text-[11px] opacity-75 leading-snug">{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Clean Policy & 24/7 AI Assistance Card */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${t.card}`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-3.5 rounded-2xl shrink-0 ${t.isDark ? "bg-amber-500/10 text-amber-400" : "bg-[#AB644B]/15 text-[#AB644B]"}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base">Grounded Policies & 24/7 Grounded AI</h2>
            <p className="text-xs opacity-75 mt-0.5">
              Have questions regarding 7-day returns, warranty claims, or express shipping? Access our official policies or ask our AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => onNavigateToView("knowledge")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${t.secondaryButton}`}
          >
            Policies & FAQs
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView("assistant")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95 ${t.primaryButton}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask 24/7 AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

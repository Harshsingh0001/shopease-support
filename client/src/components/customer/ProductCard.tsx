import React, { useState } from "react";
import { Star, ShoppingCart, Sparkles, Check, Eye, Truck } from "lucide-react";
import type { Product } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { getProductEnhancement } from "../../utils/productData";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onAskAiAboutProduct: (product: Product) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
  onAskAiAboutProduct,
  isAdded = false,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);
  const [imageLoaded, setImageLoaded] = useState(false);

  const enhancement = getProductEnhancement(product.sku);
  const imageUrl = product.image || enhancement.image;
  const originalPrice = product.originalPrice || enhancement.originalPrice;
  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );
  const reviewsCount = enhancement.reviewsCount;
  const badge = enhancement.badge;

  return (
    <div
      className={`group rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border relative overflow-hidden ${t.card}`}
    >
      <div>
        {/* Product Image Frame */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`View ${product.name} details`}
          onClick={() => onOpenDetails(product)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetails(product);
            }
          }}
          className={`relative h-56 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            t.isDark ? "bg-[#141412]" : "bg-[#f4f7f4]"
          }`}
        >
          {/* Skeleton placeholder while image loads */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 animate-pulse">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Real Studio Image with Lazy Loading & Fixed Dimensions */}
          <img
            src={imageUrl.replace("w=800", "w=480").replace("q=80", "q=75")}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="320"
            height="224"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Dark gradient overlay on bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick View Hover Pill */}
          <button
            type="button"
            aria-label={`Quick view specifications for ${product.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="absolute bottom-3 inset-x-4 py-2 rounded-xl text-xs font-bold text-white bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg hover:bg-black"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View & Specs</span>
          </button>

          {/* Top Left: Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {badge && (
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm ${
                  t.isDark
                    ? "bg-[#d9a83e] text-[#17140d]"
                    : "bg-[#059669] text-white"
                }`}
              >
                {badge}
              </span>
            )}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md border ${
                t.isDark
                  ? "bg-[#1c1b18]/90 text-[#f5e7bf] border-[#d9a83e]/30"
                  : "bg-white/95 text-[#1f2923] border-[#e2e8e2]"
              }`}
            >
              {product.category}
            </span>
          </div>

          {/* Top Right: Stock Indicator */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {product.stock <= 5 ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Only {product.stock} left</span>
              </span>
            ) : (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1 ${
                  t.isDark
                    ? "bg-[#1e3324]/90 text-[#86efac] border border-emerald-500/30"
                    : "bg-white/90 text-emerald-700 border border-emerald-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>In Stock</span>
              </span>
            )}
          </div>
        </div>

        {/* Rating & SKU Meta */}
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <div className="flex items-center gap-1 font-semibold text-amber-500">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 4.8)
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-[11px] ml-0.5">
              {product.rating || "4.8"}
            </span>
            <span className="text-[10px] opacity-60">({reviewsCount})</span>
          </div>

          <span className="font-mono text-[10px] opacity-50 uppercase">
            {product.sku}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-1.5">
          <button
            type="button"
            onClick={() => onOpenDetails(product)}
            aria-label={`View details for ${product.name}`}
            className="font-black text-sm sm:text-base leading-snug line-clamp-1 cursor-pointer hover:underline transition-colors text-left w-full"
          >
            {product.name}
          </button>
        </h3>

        {/* Description snippet */}
        <p className="text-xs opacity-75 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Express Delivery Badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-85 mb-3">
          <Truck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>{enhancement.deliveryEstimate}</span>
        </div>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="pt-3 border-t border-current/10">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg sm:text-xl font-black ${t.accentText}`}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {originalPrice > product.price && (
              <span className="text-xs line-through opacity-70">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {discountPercent > 0 && (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                t.isDark
                  ? "bg-[#d9a83e]/20 text-[#f5e7bf]"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-5 gap-2">
          {/* Ask AI Contextual Pill */}
          <button
            type="button"
            onClick={() => onAskAiAboutProduct(product)}
            title={`Ask AI: Is ${product.name} eligible for 7-day return & warranty?`}
            aria-label={`Ask AI about ${product.name}`}
            className={`col-span-2 px-2.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition active:scale-95 ${
              t.isDark
                ? "bg-[#23221e] hover:bg-[#2d2b24] text-[#f5e7bf] border-[#d9a83e]/30"
                : "bg-[#e6f4ea] hover:bg-[#d5ebd9] text-[#059669] border-[#a7f3d0]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ask AI</span>
          </button>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            aria-label={isAdded ? `${product.name} added to cart` : `Add ${product.name} to cart`}
            className={`col-span-3 px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40 ${
              isAdded
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : t.primaryButton
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

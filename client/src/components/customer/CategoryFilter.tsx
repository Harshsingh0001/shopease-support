import React, { useState } from "react";
import {
  Layers,
  Headphones,
  Watch,
  Footprints,
  Shirt,
  Briefcase,
  SlidersHorizontal,
  Check,
  Star,
  Tag,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export type SortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "discount_desc";

export interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy?: SortOption;
  onSortChange?: (option: SortOption) => void;
  inStockOnly?: boolean;
  onToggleInStock?: (inStock: boolean) => void;
  priceRange?: string;
  onSelectPriceRange?: (range: string) => void;
  minRating?: number;
  onSelectMinRating?: (rating: number) => void;
  minDiscount?: number;
  onSelectMinDiscount?: (discount: number) => void;
  onResetFilters?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy = "featured",
  onSortChange,
  inStockOnly = false,
  onToggleInStock,
  priceRange = "all",
  onSelectPriceRange,
  minRating = 0,
  onSelectMinRating,
  minDiscount = 0,
  onSelectMinDiscount,
  onResetFilters,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("electronic") || c.includes("audio")) return <Headphones className="w-3.5 h-3.5" />;
    if (c.includes("wearable") || c.includes("watch")) return <Watch className="w-3.5 h-3.5" />;
    if (c.includes("footwear") || c.includes("shoe")) return <Footprints className="w-3.5 h-3.5" />;
    if (c.includes("apparel") || c.includes("cloth")) return <Shirt className="w-3.5 h-3.5" />;
    if (c.includes("accessori") || c.includes("bag")) return <Briefcase className="w-3.5 h-3.5" />;
    return <Layers className="w-3.5 h-3.5" />;
  };

  const priceOptions = [
    { id: "all", label: "All Prices" },
    { id: "under_2000", label: "Under ₹2,000" },
    { id: "2000_5000", label: "₹2,000 - ₹5,000" },
    { id: "5000_10000", label: "₹5,000 - ₹10,000" },
    { id: "above_10000", label: "Above ₹10,000" },
  ];

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4, label: "4★ & Above" },
    { value: 3, label: "3★ & Above" },
  ];

  const discountOptions = [
    { value: 0, label: "All Discounts" },
    { value: 20, label: "20%+ Off" },
    { value: 30, label: "30%+ Off" },
  ];

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0);

  return (
    <div className="space-y-3 mb-6">
      {/* Category Pills & Top Quick Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 active:scale-95 ${
              selectedCategory === "all"
                ? t.primaryButton
                : `${t.secondaryButton} opacity-75 hover:opacity-100`
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Products</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 capitalize active:scale-95 ${
                  isSelected
                    ? t.primaryButton
                    : `${t.secondaryButton} opacity-75 hover:opacity-100`
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Right Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              showAdvancedFilters || activeFiltersCount > 0
                ? t.primaryButton
                : `${t.secondaryButton} opacity-75 hover:opacity-100`
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
          </button>

          {/* In Stock Only Checkbox */}
          {onToggleInStock && (
            <button
              type="button"
              onClick={() => onToggleInStock(!inStockOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                inStockOnly
                  ? t.isDark
                    ? "bg-[#382f1c] text-[#f5e7bf] border-[#d9a83e]/50"
                    : "bg-[#AB644B]/15 text-[#AB644B] border-[#AB644B]/30"
                  : `${t.secondaryButton} opacity-70 hover:opacity-100`
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  inStockOnly ? (t.isDark ? "bg-amber-500 border-amber-500 text-stone-950" : "bg-[#AB644B] border-[#AB644B] text-white") : "border-current/30"
                }`}
              >
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>In Stock</span>
            </button>
          )}

          {/* Sort Dropdown */}
          {onSortChange && (
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className={`pl-3 pr-6 py-1.5 text-xs rounded-xl border focus:outline-none font-semibold ${t.input}`}
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="discount_desc">Biggest Discount</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Faceted Filter Accordion Panel */}
      {showAdvancedFilters && (
        <div className={`p-4 rounded-2xl border space-y-3.5 shadow-md transition-all ${t.cardMuted} ${t.divider}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Faceted Search & Store Filters</span>
            </span>

            {onResetFilters && activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Price Range Filter */}
            {onSelectPriceRange && (
              <div>
                <label className="block font-bold opacity-80 mb-1.5">Price Range</label>
                <div className="flex flex-wrap gap-1.5">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelectPriceRange(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        priceRange === opt.id
                          ? t.primaryButton
                          : `${t.secondaryButton} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Rating Filter */}
            {onSelectMinRating && (
              <div>
                <label className="block font-bold opacity-80 mb-1.5 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Customer Rating</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onSelectMinRating(opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        minRating === opt.value
                          ? t.primaryButton
                          : `${t.secondaryButton} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Minimum Discount Filter */}
            {onSelectMinDiscount && (
              <div>
                <label className="block font-bold opacity-80 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>Limited-Time Discount</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {discountOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onSelectMinDiscount(opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        minDiscount === opt.value
                          ? t.primaryButton
                          : `${t.secondaryButton} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface ProductEnhancement {
  image: string;
  gallery: string[];
  originalPrice: number;
  badge?: string;
  reviewsCount: number;
  features: string[];
  specs: Record<string, string>;
  deliveryEstimate: string;
}

export const PRODUCT_ENHANCEMENTS: Record<string, ProductEnhancement> = {
  "PRD-001": {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 4999,
    badge: "Best Seller",
    reviewsCount: 1420,
    features: [
      "Active Noise Cancellation (ANC) with transparency mode",
      "40mm High-Res Audio Drivers with ultra-deep bass",
      "30-hour battery life with 10-minute fast charge for 5 hours",
      "Multipoint Bluetooth 5.3 connection (Laptop & Phone)",
    ],
    specs: {
      "Battery Life": "Up to 30 Hours (ANC On)",
      "Charging": "USB-C Fast Charging (10m = 5h)",
      "Bluetooth": "v5.3 Multipoint",
      "Warranty": "1-Year Official Brand Guarantee",
    },
    deliveryEstimate: "2-3 Days via Delhivery Express",
  },
  "PRD-002": {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 6999,
    badge: "Trending #1",
    reviewsCount: 980,
    features: [
      "1.96\" Ultra HD AMOLED Display with Always-On feature",
      "Advanced Heart Rate, SpO2 & Sleep Stage Monitoring",
      "IP68 50m Water Resistance for Swimming & Rain",
      "Bluetooth Calling with AI Environmental Noise Reduction",
    ],
    specs: {
      "Display": "1.96-inch AMOLED 410x502",
      "Battery": "7 Days Typical, 14 Days Standby",
      "Water Resistance": "IP68 (Up to 50m)",
      "Sensors": "Optical Heart Rate, SpO2, Accelerometer",
    },
    deliveryEstimate: "Express 24-48 Hours",
  },
  "PRD-003": {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 3499,
    badge: "Top Rated",
    reviewsCount: 650,
    features: [
      "Dynamic CloudFoam responsive cushioning midsole",
      "Breathable engineered mesh upper keeps feet dry",
      "High-grip carbon rubber traction outsole",
      "Ortholite antimicrobial comfort footbed",
    ],
    specs: {
      "Midsole": "Energy Foam Cushioning",
      "Weight": "240g (Lightweight)",
      "Sole Material": "Carbon Rubber",
      "Sizes Available": "UK 6, 7, 8, 9, 10, 11",
    },
    deliveryEstimate: "2-3 Days via Delhivery",
  },
  "PRD-004": {
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 2999,
    badge: "Classic Fit",
    reviewsCount: 410,
    features: [
      "100% Premium Heavyweight Cotton Denim (13.5 oz)",
      "Vintage stone-washed fade finish",
      "Reinforced brass buttons and dual flap chest pockets",
      "Tailored modern regular cut for effortless layering",
    ],
    specs: {
      "Material": "100% Organic Cotton Denim",
      "Wash": "Vintage Indigo Wash",
      "Pockets": "4 (2 Chest + 2 Side Welts)",
      "Care": "Machine wash cold inside out",
    },
    deliveryEstimate: "3-4 Days Express",
  },
  "PRD-005": {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 2499,
    badge: "Waterproof",
    reviewsCount: 780,
    features: [
      "900D Ballistic weather-shield water-resistant exterior",
      "Fleece-lined padded sleeve fits up to 16-inch laptops",
      "Ergonomic airflow back panel with luggage strap pass-through",
      "Integrated hidden anti-theft pocket and USB passthrough",
    ],
    specs: {
      "Capacity": "25 Liters",
      "Laptop Size": "Up to 16.2-inch MacBook Pro",
      "Fabric": "900D Ballistic Nylon",
      "Zippers": "YKK Weatherproof Zips",
    },
    deliveryEstimate: "2-3 Days via Delhivery",
  },
  "PRD-006": {
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 5999,
    badge: "Pro Choice",
    reviewsCount: 520,
    features: [
      "Hot-swappable tactile mechanical switches rated for 80M clicks",
      "South-facing per-key RGB backlighting with 22 dynamic animations",
      "CNC aluminum chassis with sound-dampening acoustic silicone pads",
      "Dual mode: Type-C braided wire + Low latency 2.4GHz wireless",
    ],
    specs: {
      "Layout": "Tenkeyless (TKL 87-key)",
      "Switches": "Tactile Mechanical (Hot-swappable)",
      "Polling Rate": "1000Hz Ultra-Low Latency",
      "Keycaps": "Double-shot PBT Keycaps",
    },
    deliveryEstimate: "2-3 Days via Delhivery Express",
  },
};

export const getProductEnhancement = (sku: string): ProductEnhancement => {
  if (PRODUCT_ENHANCEMENTS[sku]) {
    return PRODUCT_ENHANCEMENTS[sku];
  }
  // Generic fallback for any future product
  return {
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
    ],
    originalPrice: 3999,
    badge: "Verified Quality",
    reviewsCount: 320,
    features: [
      "Premium materials engineered for daily durability",
      "Quality tested with 1-Year ShopEase warranty guarantee",
      "Eligible for 7-day instant replacement and return pickup",
    ],
    specs: {
      "Warranty": "1-Year Official Warranty",
      "Origin": "Verified Authorized Distributor",
      "Condition": "Brand New Factory Sealed",
    },
    deliveryEstimate: "2-4 Days Express",
  };
};

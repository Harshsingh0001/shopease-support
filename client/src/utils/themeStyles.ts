import type { ThemeMode } from "../context/ThemeContext";

export interface ThemeStyles {
  isDark: boolean;
  // Shell & Backgrounds
  shell: string;
  pageBg: string;
  card: string;
  cardMuted: string;
  cardHover: string;
  divider: string;

  // Sidebar (Deep Forest Green in Light, Deep Charcoal/Black in Dark)
  sidebar: string;
  sidebarBrand: string;
  sidebarTabActive: string;
  sidebarTabInactive: string;
  sidebarFooter: string;

  // Buttons & Interactive
  primaryButton: string;
  secondaryButton: string;
  input: string;

  // Accents & Badges
  accentText: string;
  highlightText: string;
  badgeHighlight: string;
  badgeSuccess: string;
  badgeWarning: string;
  badgeInfo: string;

  // Floating Chat Widget Specific
  chatBubbleCustomer: string;
  chatBubbleStaff: string;
  chatBubbleAi: string;
}

export const getThemeStyles = (theme: ThemeMode): ThemeStyles => {
  const isDark = theme === "dark";

  return {
    isDark,
    // 1. Light: Warm White (#fbfbf9) / 2. Dark: Main #0d0d0b
    shell: isDark ? "bg-[#0d0d0b] text-[#f5f4ef]" : "bg-[#fbfbf9] text-[#1f2923]",
    pageBg: isDark ? "bg-[#0d0d0b]" : "bg-[#fbfbf9]",

    // Cards: 1. Light: White / Warm White (#ffffff) / 2. Dark: #1c1b18
    card: isDark
      ? "bg-[#1c1b18] border border-[#353229] text-[#f5f4ef]"
      : "bg-white border border-[#e2e8e2] text-[#1f2923] shadow-sm",
    cardMuted: isDark
      ? "bg-[#23221e] border border-[#353229]"
      : "bg-[#f7f7f4] border border-[#e2e8e2]",
    cardHover: isDark ? "hover:bg-[#25241f]" : "hover:bg-[#f3f7f4]",
    divider: isDark ? "border-[#353229]" : "border-[#e2e8e2]",

    // Sidebar: 1. Light: Deep Forest Green (#124a38) / 2. Dark: Charcoal/Black (#11110f)
    sidebar: isDark
      ? "bg-[#11110f] border-r border-[#353229] text-[#f5e7bf]"
      : "bg-[#124a38] border-r border-[#0e3b2c] text-[#f2f7f4]",
    sidebarBrand: isDark
      ? "bg-[#382f1c] text-[#d9a83e] border border-[#d9a83e]/30"
      : "bg-[#0e3b2c] text-[#a7f3d0] border border-[#185a45]",
    sidebarTabActive: isDark
      ? "bg-[#d9a83e] text-[#17140d] font-bold shadow-lg shadow-[#d9a83e]/20"
      : "bg-[#059669] text-white font-bold shadow-lg shadow-[#059669]/25",
    sidebarTabInactive: isDark
      ? "text-[#a39c8c] hover:bg-[#1d1c18] hover:text-[#f5e7bf]"
      : "text-[#a3c4b2] hover:bg-[#185a45] hover:text-white",
    sidebarFooter: isDark
      ? "border-t border-[#353229]"
      : "border-t border-[#0e3b2c]",

    // Buttons: 1. Light: Emerald Green (#059669) / 2. Dark: Premium Gold (#d9a83e)
    primaryButton: isDark
      ? "bg-[#d9a83e] hover:bg-[#edbd52] text-[#17140d] font-bold shadow-md shadow-[#d9a83e]/25 transition"
      : "bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-md shadow-[#059669]/20 transition",
    secondaryButton: isDark
      ? "bg-[#23221e] hover:bg-[#2c2b26] text-[#f5f4ef] border border-[#353229] transition"
      : "bg-white hover:bg-[#f3f7f4] text-[#1f2923] border border-[#e2e8e2] transition",
    input: isDark
      ? "bg-[#23221e] border border-[#353229] text-[#f5f4ef] placeholder-[#857f72] focus:border-[#d9a83e]"
      : "bg-white border border-[#d1dbd4] text-[#1f2923] placeholder-[#809187] focus:border-[#059669]",

    // Accents & Highlights: 1. Light: Green accents / 2. Dark: Premium Gold (#d9a83e) & Champagne (#f5e7bf)
    accentText: isDark ? "text-[#d9a83e]" : "text-[#059669]",
    highlightText: isDark ? "text-[#f5e7bf]" : "text-[#10b981]",
    badgeHighlight: isDark
      ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/30"
      : "bg-[#e6f4ea] text-[#047857] border border-[#a7f3d0]",
    badgeSuccess: isDark
      ? "bg-[#1e3324] text-[#86efac]"
      : "bg-[#e6f4ea] text-[#059669]",
    badgeWarning: isDark
      ? "bg-[#382f1c] text-[#f5e7bf]"
      : "bg-[#fef3c7] text-[#b45309]",
    badgeInfo: isDark
      ? "bg-[#1e2a3a] text-[#93c5fd]"
      : "bg-[#eff6ff] text-[#1d4ed8]",

    // Floating Chat bubbles
    chatBubbleCustomer: isDark
      ? "bg-[#23221e] border border-[#353229] text-[#f5f4ef] rounded-tl-sm"
      : "bg-white border border-[#e2e8e2] text-[#1f2923] rounded-tl-sm shadow-sm",
    chatBubbleStaff: isDark
      ? "bg-[#d9a83e] text-[#17140d] font-medium rounded-tr-sm shadow-md"
      : "bg-[#059669] text-white rounded-tr-sm shadow-md",
    chatBubbleAi: isDark
      ? "bg-[#382f1c] border border-[#d9a83e]/40 text-[#f5e7bf] rounded-tl-sm"
      : "bg-[#e6f4ea] border border-[#a7f3d0] text-[#047857] rounded-tl-sm",
  };
};

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
    // Shell & Backgrounds: Deep obsidian black in Dark
    shell: isDark ? "bg-[#070705] text-[#f5f4ef]" : "bg-[#fbfbf9] text-[#1f2923]",
    pageBg: isDark ? "bg-[#070705]" : "bg-[#fbfbf9]",

    // Cards: 1. Light: White / Warm White (#ffffff) / 2. Dark: Glassy obsidian with gold trim
    card: isDark
      ? "bg-[#0c0b08]/90 border border-amber-500/20 text-[#f5f4ef] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
      : "bg-white border border-[#e2e8e2] text-[#1f2923] shadow-sm",
    cardMuted: isDark
      ? "bg-[#11100c]/85 border border-amber-500/15"
      : "bg-[#f7f7f4] border border-[#e2e8e2]",
    cardHover: isDark ? "hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(217,168,62,0.2)] transition-all duration-300" : "hover:bg-[#f3f7f4]",
    divider: isDark ? "border-amber-500/20" : "border-[#e2e8e2]",

    // Sidebar: 1. Light: Deep Forest Green (#124a38) / 2. Dark: Pitch Black with gold trim (#090807)
    sidebar: isDark
      ? "bg-[#090807] border-r border-amber-500/20 text-[#f5e7bf]"
      : "bg-[#124a38] border-r border-[#0e3b2c] text-[#f2f7f4]",
    sidebarBrand: isDark
      ? "bg-gradient-to-br from-amber-500/25 via-yellow-600/15 to-amber-900/30 text-amber-300 border border-amber-500/40 shadow-[0_0_20px_rgba(217,168,62,0.3)]"
      : "bg-[#0e3b2c] text-[#a7f3d0] border border-[#185a45]",
    sidebarTabActive: isDark
      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black shadow-lg shadow-amber-500/25"
      : "bg-[#059669] text-white font-bold shadow-lg shadow-[#059669]/25",
    sidebarTabInactive: isDark
      ? "text-[#a39c8c] hover:bg-[#16140e] hover:text-[#f5e7bf] transition-all duration-200"
      : "text-[#a3c4b2] hover:bg-[#185a45] hover:text-white",
    sidebarFooter: isDark
      ? "border-t border-amber-500/20"
      : "border-t border-[#0e3b2c]",

    // Buttons: 1. Light: Emerald Green (#059669) / 2. Dark: Glossy Liquid Gold (#d9a83e) with hover lift
    primaryButton: isDark
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black shadow-[0_0_25px_rgba(217,168,62,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(217,168,62,0.65)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
      : "bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-md shadow-[#059669]/20 transition",
    secondaryButton: isDark
      ? "bg-[#12110e] hover:bg-[#1c1913] text-amber-200 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_15px_rgba(217,168,62,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
      : "bg-white hover:bg-[#f3f7f4] text-[#1f2923] border border-[#e2e8e2] transition",
    input: isDark
      ? "bg-[#0a0907] border border-amber-500/25 text-[#f5f4ef] placeholder-[#857f72] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all duration-200"
      : "bg-white border border-[#d1dbd4] text-[#1f2923] placeholder-[#809187] focus:border-[#059669]",

    // Accents & Highlights: 1. Light: Green accents / 2. Dark: Premium Gold (#d9a83e) & Champagne (#f5e7bf)
    accentText: isDark ? "text-amber-400" : "text-[#059669]",
    highlightText: isDark ? "text-amber-200" : "text-[#10b981]",
    badgeHighlight: isDark
      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(217,168,62,0.2)]"
      : "bg-[#e6f4ea] text-[#047857] border border-[#a7f3d0]",
    badgeSuccess: isDark
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
      : "bg-[#e6f4ea] text-[#059669]",
    badgeWarning: isDark
      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
      : "bg-[#fef3c7] text-[#b45309]",
    badgeInfo: isDark
      ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
      : "bg-[#eff6ff] text-[#1d4ed8]",

    // Floating Chat bubbles: Glossy gold customer bubble & obsidian glass AI bubble
    chatBubbleCustomer: isDark
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold shadow-[0_6px_25px_rgba(217,168,62,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] border border-amber-300/40 rounded-tl-sm transition-all duration-200"
      : "bg-white border border-[#e2e8e2] text-[#1f2923] rounded-tl-sm shadow-sm",
    chatBubbleStaff: isDark
      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold rounded-tr-sm shadow-md"
      : "bg-[#059669] text-white rounded-tr-sm shadow-md",
    chatBubbleAi: isDark
      ? "bg-gradient-to-b from-[#11100d] via-[#090807] to-[#040404] border border-amber-500/25 text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-tl-sm backdrop-blur-xl transition-all duration-200"
      : "bg-[#e6f4ea] border border-[#a7f3d0] text-[#047857] rounded-tl-sm",
  };
};

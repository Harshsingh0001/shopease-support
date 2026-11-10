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

  // Sidebar (Deep Slate in Terracotta Light, Deep Charcoal/Black in Dark)
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
    // Shell & Backgrounds: Deep obsidian in Dark, Warm Cream (#F2F2EB) in Default Terracotta
    shell: isDark ? "bg-[#070705] text-[#f5f4ef]" : "bg-[#F2F2EB] text-[#141c22]",
    pageBg: isDark ? "bg-[#070705]" : "bg-[#F2F2EB]",

    // Cards: 1. Default Mode: Slate Grey (#9CABB4) cards with #8396a1 borders (no harsh white) / 2. Dark: Glassy obsidian with gold trim
    card: isDark
      ? "bg-[#0c0b08]/90 border border-amber-500/20 text-[#f5f4ef] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
      : "bg-[#9CABB4] border border-[#8396a1] text-[#141c22] shadow-[0_4px_16px_rgba(36,46,53,0.12)]",
    cardMuted: isDark
      ? "bg-[#11100c]/85 border border-amber-500/15"
      : "bg-[#8a9ca7]/35 border border-[#8396a1]/50",
    cardHover: isDark
      ? "hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(217,168,62,0.2)] transition-all duration-300"
      : "hover:border-[#AB644B] hover:shadow-lg transition-all duration-200",
    divider: isDark ? "border-amber-500/20" : "border-[#8396a1]/40",

    // Sidebar: 1. Default: Deep Slate (#242e35) with #AB644B Terracotta brand & active tab, #9CABB4 text / 2. Dark: Pitch Black with gold trim
    sidebar: isDark
      ? "bg-[#090807] border-r border-amber-500/20 text-[#f5e7bf]"
      : "bg-[#242e35] border-r border-[#34424c] text-[#F2F2EB]",
    sidebarBrand: isDark
      ? "bg-gradient-to-br from-amber-500/25 via-yellow-600/15 to-amber-900/30 text-amber-300 border border-amber-500/40 shadow-[0_0_20px_rgba(217,168,62,0.3)]"
      : "bg-[#AB644B] text-white border border-[#96543d] shadow-md shadow-[#AB644B]/30",
    sidebarTabActive: isDark
      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black shadow-lg shadow-amber-500/25"
      : "bg-[#AB644B] text-white font-bold shadow-md shadow-[#AB644B]/25",
    sidebarTabInactive: isDark
      ? "text-[#a39c8c] hover:bg-[#16140e] hover:text-[#f5e7bf] transition-all duration-200"
      : "text-[#9CABB4] hover:bg-[#2f3b44] hover:text-[#F2F2EB] transition-all duration-200",
    sidebarFooter: isDark
      ? "border-t border-amber-500/20"
      : "border-t border-[#34424c]",

    // Buttons: 1. Default: Rich Terracotta (#AB644B) / 2. Dark: Glossy Liquid Gold (#d9a83e) with hover lift
    primaryButton: isDark
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black shadow-[0_0_25px_rgba(217,168,62,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(217,168,62,0.65)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
      : "bg-[#AB644B] hover:bg-[#96543d] text-white font-bold shadow-md shadow-[#AB644B]/25 hover:shadow-lg hover:shadow-[#AB644B]/35 hover:scale-[1.02] active:scale-95 transition-all duration-200",
    secondaryButton: isDark
      ? "bg-[#12110e] hover:bg-[#1c1913] text-amber-200 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_15px_rgba(217,168,62,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
      : "bg-[#D2DCE6] hover:bg-[#c2ceda] text-[#141c22] border border-[#8396a1] hover:border-[#AB644B] shadow-sm hover:scale-[1.01] active:scale-95 transition-all duration-200",
    input: isDark
      ? "bg-[#0a0907] border border-amber-500/25 text-[#f5f4ef] placeholder-[#857f72] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all duration-200"
      : "bg-[#F2F2EB] border border-[#8396a1] text-[#141c22] placeholder-[#5a6c76] focus:border-[#AB644B] focus:ring-2 focus:ring-[#AB644B]/20 transition-all duration-200",

    // Accents & Highlights: 1. Default: Terracotta / 2. Dark: Premium Gold (#d9a83e) & Champagne (#f5e7bf)
    accentText: isDark ? "text-amber-400" : "text-[#8a3922]",
    highlightText: isDark ? "text-amber-200" : "text-[#8a3922]",
    badgeHighlight: isDark
      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(217,168,62,0.2)]"
      : "bg-[#AB644B]/20 text-[#7a321e] border border-[#AB644B]/40",
    badgeSuccess: isDark
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
      : "bg-emerald-500/20 text-emerald-800 border border-emerald-500/30",
    badgeWarning: isDark
      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
      : "bg-amber-500/20 text-amber-900 border border-amber-500/40",
    badgeInfo: isDark
      ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
      : "bg-[#D2DCE6] text-[#141c22] border border-[#8396a1]/50",

    // Floating Chat bubbles:
    chatBubbleCustomer: isDark
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold shadow-[0_6px_25px_rgba(217,168,62,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] border border-amber-300/40 rounded-tl-sm transition-all duration-200"
      : "bg-[#9CABB4] border border-[#8396a1] text-[#141c22] rounded-tl-sm shadow-sm",
    chatBubbleStaff: isDark
      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold rounded-tr-sm shadow-md"
      : "bg-[#AB644B] text-white rounded-tr-sm shadow-md",
    chatBubbleAi: isDark
      ? "bg-gradient-to-b from-[#11100d] via-[#090807] to-[#040404] border border-amber-500/25 text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-tl-sm backdrop-blur-xl transition-all duration-200"
      : "bg-[#D2DCE6]/70 border border-[#8396a1]/50 text-[#141c22] rounded-tl-sm",
  };
};

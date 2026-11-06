import React, { useState } from "react";
import {
  Settings,
  Building,
  Users,
  Bot,
  Zap,
  Shield,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  X,
  Sliders,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "agent";
  queue: string;
  status: "active" | "inactive";
  lastActive?: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "tm-1",
    name: "Vikram Mehta",
    email: "admin@shopease.local",
    role: "admin",
    queue: "All Queues + System Ops",
    status: "active",
    lastActive: "Just now",
  },
  {
    id: "tm-2",
    name: "Aditi Verma",
    email: "supervisor@shopease.local",
    role: "supervisor",
    queue: "Escalations, Refunds & Analytics",
    status: "active",
    lastActive: "12 mins ago",
  },
  {
    id: "tm-3",
    name: "Priya Sharma",
    email: "agent@shopease.local",
    role: "agent",
    queue: "Order Delivery & Returns Desk",
    status: "active",
    lastActive: "4 mins ago",
  },
];

export const CrmSettingsView: React.FC = () => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [activeTab, setActiveTab] = useState<
    "org" | "team" | "ai_config" | "automation" | "audit"
  >("team");

  // Tab 1: Organization State
  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem("shopease_store_name") || "ShopEase Omnichannel Store";
  });
  const [supportEmail, setSupportEmail] = useState(() => {
    return localStorage.getItem("shopease_support_email") || "support@shopease.local";
  });
  const [supportPhone, setSupportPhone] = useState("+91 8000 123 456");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +05:30)");
  const [returnWindowDays, setReturnWindowDays] = useState("7");

  // Tab 2: Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem("shopease_crm_team_members");
      return saved ? JSON.parse(saved) : DEFAULT_TEAM;
    } catch {
      return DEFAULT_TEAM;
    }
  });
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form fields for Member Add / Edit Modal
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalRole, setModalRole] = useState<TeamMember["role"]>("agent");
  const [modalQueue, setModalQueue] = useState("Order Delivery & Returns");
  const [modalStatus, setModalStatus] = useState<"active" | "inactive">("active");

  // Tab 3: AI Engine Config State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [confidenceThreshold, setConfidenceThreshold] = useState("85");
  const [temperature, setTemperature] = useState("0.2");
  const [multiLingualAutoDetect, setMultiLingualAutoDetect] = useState(true);

  // Tab 4: Automation State
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [autoCloseDays, setAutoCloseDays] = useState("3");
  const [vipThreshold, setVipThreshold] = useState("10000");

  // Feedback Notification
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const openAddMemberModal = () => {
    setEditingMember(null);
    setModalName("");
    setModalEmail("");
    setModalRole("agent");
    setModalQueue("Order Delivery & Returns");
    setModalStatus("active");
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMember(member);
    setModalName(member.name);
    setModalEmail(member.email);
    setModalRole(member.role);
    setModalQueue(member.queue);
    setModalStatus(member.status);
    setIsMemberModalOpen(true);
  };

  const handleSaveMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalEmail.trim()) return;

    if (editingMember) {
      // Update existing
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                name: modalName.trim(),
                email: modalEmail.trim(),
                role: modalRole,
                queue: modalQueue,
                status: modalStatus,
              }
            : m
        )
      );
      setSavedNotice(`Team member ${modalName} updated.`);
    } else {
      // Add new
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: modalName.trim(),
        email: modalEmail.trim(),
        role: modalRole,
        queue: modalQueue,
        status: modalStatus,
        lastActive: "Just added",
      };
      setTeamMembers((prev) => [...prev, newMember]);
      setSavedNotice(`New staff member ${modalName} added with role ${modalRole.toUpperCase()}.`);
    }

    setIsMemberModalOpen(false);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove team member "${name}" from CRM staff access?`)) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      setSavedNotice(`Removed ${name} from active staff.`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const handleToggleStatus = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "active" ? "inactive" : "active" }
          : m
      )
    );
  };

  const handleQuickRoleChange = (id: string, newRole: TeamMember["role"]) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
    setSavedNotice(`Updated role permissions to ${newRole.toUpperCase()}.`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist to localStorage
    localStorage.setItem("shopease_store_name", storeName);
    localStorage.setItem("shopease_support_email", supportEmail);
    localStorage.setItem("shopease_crm_team_members", JSON.stringify(teamMembers));

    const changeSummary =
      activeTab === "team"
        ? `Saved ${teamMembers.length} team members and RBAC role assignments.`
        : activeTab === "org"
        ? `Organization metadata & store profile updated.`
        : activeTab === "ai_config"
        ? `AI orchestration parameters & confidence thresholds synced.`
        : activeTab === "automation"
        ? `Ticket routing & SLA automation rules updated.`
        : `All CRM Enterprise settings successfully synced across cluster.`;

    setSavedNotice(changeSummary);
    setTimeout(() => setSavedNotice(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Settings className={`w-7 h-7 ${t.accentText}`} />
            <span>CRM Enterprise Settings & Control Center</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Configure organization metadata, role-based access control (RBAC), AI orchestration parameters, and automation routing.
          </p>
        </div>

        {savedNotice && (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-current/10 pb-2 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: "team", label: "Team & Role Access", icon: Users, count: teamMembers.length },
          { id: "org", label: "Organization & Store", icon: Building },
          { id: "ai_config", label: "AI Engine Configuration", icon: Bot },
          { id: "automation", label: "Automation & Routing", icon: Zap },
          { id: "audit", label: "Security & Audit Logs", icon: Shield },
        ].map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
                isActive ? t.primaryButton : "opacity-60 hover:opacity-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tb.label}</span>
              {tb.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : t.badgeHighlight
                  }`}
                >
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* ===================================================================
            TAB: TEAM & ROLE ACCESS (WITH FULL INLINE & MODAL EDITING)
            =================================================================== */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className={`rounded-3xl border overflow-hidden shadow-xl ${t.card}`}>
              {/* Table Top Bar */}
              <div className="p-5 border-b border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2">
                    <Users className={`w-4 h-4 ${t.accentText}`} />
                    <span>Staff Directory & Role-Based Permissions</span>
                  </h3>
                  <p className="text-xs opacity-70">
                    Edit user roles, assign department queues, toggle active status, and invite new support staff.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddMemberModal}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition ${t.primaryButton}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Team Member</span>
                </button>
              </div>

              {/* Responsive Team Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b font-bold opacity-75 ${t.divider} ${t.cardMuted}`}>
                      <th className="p-4">Name & Email</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Assigned Queue</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Active</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-current/5 transition">
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            <span>{member.name}</span>
                            {member.role === "admin" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold">
                                SuperAdmin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-60 font-mono">{member.email}</div>
                        </td>

                        {/* Interactive Role Switcher */}
                        <td className="p-4">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleQuickRoleChange(member.id, e.target.value as TeamMember["role"])
                            }
                            className={`px-2 py-1 rounded-lg text-xs font-extrabold uppercase border focus:outline-none cursor-pointer transition ${
                              t.input
                            }`}
                          >
                            <option value="admin">ADMIN</option>
                            <option value="supervisor">SUPERVISOR</option>
                            <option value="agent">AGENT</option>
                          </select>
                        </td>

                        <td className="p-4 font-semibold opacity-90">{member.queue}</td>

                        {/* Interactive Status Toggle */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(member.id)}
                            title="Click to toggle status"
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase transition ${
                              member.status === "active"
                                ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                : "bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30"
                            }`}
                          >
                            {member.status === "active" ? "● Active" : "○ Inactive"}
                          </button>
                        </td>

                        <td className="p-4 opacity-60 font-mono text-[11px]">{member.lastActive || "—"}</td>

                        {/* Row Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditMemberModal(member)}
                              title="Edit Member Details"
                              className={`p-1.5 rounded-lg border opacity-80 hover:opacity-100 transition ${t.secondaryButton}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              title="Remove Team Member"
                              className="p-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RBAC Privilege Matrix Breakdown */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
              <h4 className="font-black text-sm flex items-center gap-2">
                <Shield className={`w-4 h-4 ${t.accentText}`} />
                <span>Role-Based Access Control (RBAC) Permission Matrix</span>
              </h4>
              <p className="text-xs opacity-70">
                System boundaries enforced across REST endpoints and Socket.IO real-time channels:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* Role 1: Admin */}
                <div className={`p-4 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="font-extrabold uppercase mb-2 text-amber-500 flex items-center justify-between">
                    <span>Admin</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">1 Account</span>
                  </div>
                  <div className="text-[11px] font-bold mb-2 opacity-90">Vikram Mehta</div>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Full Root System & Cluster Control</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Team Member & Role Management</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>AI Model Engine Tuning & Rules</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Direct Bank Refunds & Overrides</span>
                    </li>
                  </ul>
                </div>

                {/* Role 2: Supervisor (Absorbs Manager duties) */}
                <div className={`p-4 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="font-extrabold uppercase mb-2 text-purple-400 flex items-center justify-between">
                    <span>Supervisor</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold">1 Account</span>
                  </div>
                  <div className="text-[11px] font-bold mb-2 opacity-90">Aditi Verma</div>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tier-2 Escalations & High-Value Tickets</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Approve / Reject Return Claims</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Issue Direct Bank Refunds</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Full RAG Knowledge Base Editor</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Executive Analytics & CSV Export (Manager Duty)</span>
                    </li>
                  </ul>
                </div>

                {/* Role 3: Support Agent */}
                <div className={`p-4 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="font-extrabold uppercase mb-2 text-emerald-500 flex items-center justify-between">
                    <span>Support Agent</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold">1 Account</span>
                  </div>
                  <div className="text-[11px] font-bold mb-2 opacity-90">Priya Sharma</div>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>3-Column CRM Inbox & Ticket Queue</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Confidential Internal Staff Notes</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Customer Context 360 & Order Lookup</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Test RAG Knowledge Base Simulator</span>
                    </li>
                    <li className="flex items-center gap-1.5 opacity-40">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Cannot Modify System Settings</span>
                    </li>
                  </ul>
                </div>

                {/* Role 4: Customer */}
                <div className={`p-4 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="font-extrabold uppercase mb-2 text-blue-500 flex items-center justify-between">
                    <span>Customer</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-500 font-bold">2 Accounts</span>
                  </div>
                  <div className="text-[11px] font-bold mb-2 opacity-90">Aman Gupta &amp; Rohit Kumar</div>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>E-Commerce Storefront Catalogue</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Shopping Cart &amp; Order Checkout</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Live Order Tracking &amp; Milestones</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>AI Support Assistant (Chat &amp; Voice)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>File Return &amp; Replacement Claims</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: ORGANIZATION & STORE
            =================================================================== */}
        {activeTab === "org" && (
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
            <h3 className="font-black text-sm flex items-center gap-2">
              <Building className={`w-4 h-4 ${t.accentText}`} />
              <span>Store & Company Metadata</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Store Front Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Support Contact Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Support Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Operational Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                  <option value="UTC">UTC Universal</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Customer Return Window (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Registered GSTIN Number</label>
                <input
                  type="text"
                  disabled
                  value="29AABCU9603R1ZM (Verified Indian Tax Entity)"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-current/5 opacity-70 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: AI ENGINE CONFIGURATION
            =================================================================== */}
        {activeTab === "ai_config" && (
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
            <h3 className="font-black text-sm flex items-center gap-2">
              <Bot className={`w-4 h-4 ${t.accentText}`} />
              <span>Autonomous AI Support Engine Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-current/10">
                <div>
                  <div className="font-bold">Autonomous AI Support</div>
                  <div className="text-[11px] opacity-70">Enable instant answers grounded in DB</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Primary LLM Engine</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra-Low Latency &lt;820ms)</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Multilingual Reasoning)</option>
                  <option value="gpt-4o">OpenAI GPT-4o (Failover Cluster)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80 flex items-center justify-between">
                  <span>Human Escalation Confidence Threshold</span>
                  <span className={`font-mono font-bold ${t.accentText}`}>{confidenceThreshold}%</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] opacity-60">
                  Queries with confidence below {confidenceThreshold}% are automatically transferred to human queue.
                </span>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80 flex items-center justify-between">
                  <span>Temperature (Hallucination Guardrail)</span>
                  <span className={`font-mono font-bold ${t.accentText}`}>{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="0.7"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] opacity-60">
                  Low temperature (0.2) strictly enforces factual database adherence.
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-current/10 sm:col-span-2">
                <div>
                  <div className="font-bold">Multilingual Automatic Code-Switching</div>
                  <div className="text-[11px] opacity-70">Seamlessly detect & respond in English, Hindi & Hinglish</div>
                </div>
                <input
                  type="checkbox"
                  checked={multiLingualAutoDetect}
                  onChange={(e) => setMultiLingualAutoDetect(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: AUTOMATION & ROUTING
            =================================================================== */}
        {activeTab === "automation" && (
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
            <h3 className="font-black text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Smart Ticket Routing & Auto-Assignment Rules</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-current/10">
                <div>
                  <div className="font-bold">Round-Robin Auto-Assignment</div>
                  <div className="text-[11px] opacity-70">
                    Automatically distribute escalated tickets to available online agents
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoAssignment}
                  onChange={(e) => setAutoAssignment(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-current/10">
                <div>
                  <div className="font-bold">Urgent SLA Breach Notifications</div>
                  <div className="text-[11px] opacity-70">
                    Send high-priority alert when ticket response time exceeds 15 minutes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={slaAlerts}
                  onChange={(e) => setSlaAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold mb-1 opacity-80">Auto-Close Resolved Tickets (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={autoCloseDays}
                    onChange={(e) => setAutoCloseDays(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-80">VIP Customer Spend Threshold (₹)</label>
                  <input
                    type="number"
                    value={vipThreshold}
                    onChange={(e) => setVipThreshold(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: SECURITY & AUDIT LOGS
            =================================================================== */}
        {activeTab === "audit" && (
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Security, RBAC Enforcement & System Audit Log</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                Immutable Ledger • 100% Compliant
              </span>
            </div>

            <p className="text-xs opacity-70">
              Cryptographically timestamped action logs for regulatory compliance and audit trails.
            </p>

            <div className="space-y-2 text-xs">
              {[
                {
                  action: "Admin Vikram Mehta updated RAG policy '7-Day Return Guarantee'",
                  time: "Today, 11:24 AM",
                  ip: "192.168.1.42",
                  actor: "Vikram Mehta (Admin)",
                },
                {
                  action: "Staff Agent Priya Sharma assigned ticket TKT-1001",
                  time: "Today, 10:15 AM",
                  ip: "192.168.1.18",
                  actor: "Priya Sharma (Agent)",
                },
                {
                  action: "Socket.IO authenticated customer session Aman Gupta (QCnGdNP_9lbsMsd6AAAB)",
                  time: "Today, 09:40 AM",
                  ip: "103.21.244.2",
                  actor: "Aman Gupta (Customer)",
                },
                {
                  action: "Order #ORD-1001 fulfillment status set to 'shipped' (AWB: DLH82947192)",
                  time: "Yesterday, 04:12 PM",
                  ip: "192.168.1.42",
                  actor: "System Automation",
                },
                {
                  action: "Agent Rahul Sharma posted confidential internal note on ticket TKT-1002",
                  time: "Yesterday, 02:30 PM",
                  ip: "192.168.1.25",
                  actor: "Rahul Sharma (Agent)",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${t.cardMuted} ${t.divider}`}
                >
                  <div>
                    <div className="font-semibold">{log.action}</div>
                    <div className="text-[10px] opacity-60 font-mono flex items-center gap-2 mt-0.5">
                      <span>Actor: {log.actor}</span>
                      <span>•</span>
                      <span>Client IP: {log.ip}</span>
                    </div>
                  </div>
                  <span className="text-[10px] opacity-60 font-mono self-end sm:self-auto shrink-0">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Save Changes Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${t.card} ${t.divider}`}>
          <div className="text-xs opacity-75 text-center sm:text-left">
            <span className="font-bold">Active Configuration:</span>{" "}
            {activeTab === "team" && (
              <span>Saving {teamMembers.length} staff accounts, permissions &amp; assigned queues</span>
            )}
            {activeTab === "org" && (
              <span>Saving &quot;{storeName}&quot; metadata &amp; support contact details</span>
            )}
            {activeTab === "ai_config" && (
              <span>Saving {aiModel} parameters, temperature &amp; {confidenceThreshold}% escalation threshold</span>
            )}
            {activeTab === "automation" && (
              <span>Saving ticket assignment, SLA alerts &amp; VIP routing rules</span>
            )}
            {activeTab === "audit" && (
              <span>Audit trail is immutable; click to sync cluster configurations</span>
            )}
          </div>

          <button
            type="submit"
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black shadow-lg active:scale-95 transition flex items-center justify-center gap-2 ${t.primaryButton}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* ===================================================================
          MODAL: ADD / EDIT TEAM MEMBER
          =================================================================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 ${t.card}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Users className={`w-4 h-4 ${t.accentText}`} />
                <span>{editingMember ? "Edit Team Member Permissions" : "Invite New Team Member"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Full Name</label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Neha Kapoor"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="e.g. neha.support@shopease.local"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 opacity-80">System Role</label>
                  <select
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value as TeamMember["role"])}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                  >
                    <option value="agent">Support Agent (Level 1 Frontline)</option>
                    <option value="supervisor">Supervisor (Level 2 Escalations &amp; Analytics)</option>
                    <option value="admin">Admin (Root System Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-80">Account Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as "active" | "inactive")}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Assigned Department Queue</label>
                <select
                  value={modalQueue}
                  onChange={(e) => setModalQueue(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="Order Delivery & Returns">Order Delivery &amp; Returns</option>
                  <option value="Tier-2 Hardware & Voice">Tier-2 Hardware &amp; Voice</option>
                  <option value="Escalations & High-Value Claims">Escalations &amp; High-Value Claims</option>
                  <option value="Billing & Refunds">Billing &amp; Refunds</option>
                  <option value="All Queues + System Ops">All Queues + System Ops</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl opacity-70 hover:opacity-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold transition shadow-md ${t.primaryButton}`}
                >
                  {editingMember ? "Update Member" : "Add to Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

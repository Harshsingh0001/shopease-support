import React, { useState } from "react";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";
import type { ReturnRequest } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { INITIAL_RETURNS } from "../../utils/mockCrmData";

export const CrmReturnsRefundsView: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const canApprove = user?.role === "supervisor" || user?.role === "admin";

  const [returns, setReturns] = useState<ReturnRequest[]>(INITIAL_RETURNS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredReturns = returns.filter((r) => {
    const matchesSearch =
      r.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (returnId: string, newStatus: ReturnRequest["status"]) => {
    setReturns((prev) =>
      prev.map((r) => (r._id === returnId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
    );
    if (selectedReturn?._id === returnId) {
      setSelectedReturn((prev) => (prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null));
    }
    setActionNotice(`Return request status updated to "${newStatus.replace("_", " ").toUpperCase()}". Audit logged.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <RotateCcw className={`w-7 h-7 ${t.accentText}`} />
            <span>Returns & Refund Approvals Desk</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Review customer return requests, authorize reverse Delhivery pickups, and initiate bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search return ID, order, customer..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${t.input}`}
            />
          </div>

          <div className="flex gap-1 border rounded-2xl p-0.5 shrink-0 text-xs font-bold">
            {["all", "pending_review", "approved", "refund_processed", "rejected"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl uppercase text-[10px] transition ${
                  statusFilter === st ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className={`p-4 rounded-3xl border grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm text-xs ${t.cardMuted} ${t.divider}`}>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Total Return Claims</div>
          <div className={`text-xl font-black ${t.accentText}`}>{returns.length} Requests</div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Pending Staff Review</div>
          <div className="text-xl font-black text-amber-500">
            {returns.filter((r) => r.status === "pending_review").length} Awaiting
          </div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Pickups Approved</div>
          <div className="text-xl font-black text-blue-500">
            {returns.filter((r) => r.status === "approved" || r.status === "pickup_scheduled").length} Active
          </div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Refunds Disbursed</div>
          <div className="text-xl font-black text-emerald-500">
            ₹{returns.filter((r) => r.status === "refund_processed").reduce((s, r) => s + r.refundAmount, 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${t.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b font-bold opacity-75 ${t.divider} ${t.cardMuted}`}>
                <th className="p-4">Return ID & Date</th>
                <th className="p-4">Customer & Order</th>
                <th className="p-4">Product Claim</th>
                <th className="p-4">Reason Category</th>
                <th className="p-4">Refund Amount</th>
                <th className="p-4">Carrier Pickup</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center opacity-50">
                    No return claims match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr
                    key={ret._id}
                    onClick={() => setSelectedReturn(ret)}
                    className="hover:bg-current/5 transition cursor-pointer"
                  >
                    <td className="p-4">
                      <div className={`font-mono font-black ${t.accentText}`}>{ret.returnNumber}</div>
                      <div className="text-[10px] opacity-60">
                        {new Date(ret.requestedAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold">{ret.customerName}</div>
                      <div className="font-mono text-[10px] opacity-70">{ret.orderNumber}</div>
                    </td>

                    <td className="p-4 max-w-xs truncate font-medium">
                      {ret.productName}
                    </td>

                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-current/10 font-semibold text-[10px]">
                        {ret.reason.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 font-black text-sm">
                      ₹{ret.refundAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 font-mono text-[10px]">
                      {ret.trackingAwb || "Pending"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          ret.status === "refund_processed"
                            ? t.badgeSuccess
                            : ret.status === "approved"
                            ? t.badgeInfo
                            : ret.status === "pending_review"
                            ? t.badgeWarning
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        ● {ret.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReturn(ret);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition ${t.secondaryButton}`}
                      >
                        Review &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Details & Approval Drawer */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-xl rounded-3xl p-6 border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${t.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <span>Return Claim: {selectedReturn.returnNumber}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                    {selectedReturn.status.replace("_", " ")}
                  </span>
                </h3>
                <div className="text-xs opacity-70 mt-0.5">
                  Order #{selectedReturn.orderNumber} • Customer: {selectedReturn.customerName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 rounded-xl opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-2xl border space-y-1 ${t.cardMuted} ${t.divider}`}>
                <div className="font-bold opacity-60 uppercase text-[10px]">Product & Claim Details</div>
                <div className="font-bold text-sm">{selectedReturn.productName}</div>
                <div className="text-[11px] opacity-75">
                  Reason: <strong className="capitalize">{selectedReturn.reason.replace("_", " ")}</strong>
                </div>
                <p className="pt-1 italic">"{selectedReturn.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="text-[10px] font-bold opacity-60 uppercase">Authorized Refund</div>
                  <div className={`text-lg font-black ${t.accentText}`}>
                    ₹{selectedReturn.refundAmount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] opacity-60">To original payment source</div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                  <div className="text-[10px] font-bold opacity-60 uppercase">Reverse Courier AWB</div>
                  <div className="text-sm font-mono font-bold text-emerald-600">
                    {selectedReturn.trackingAwb}
                  </div>
                  <div className="text-[10px] opacity-60">Delhivery Reverse Line-haul</div>
                </div>
              </div>
            </div>

            {/* Approval Decision Buttons (RBAC Enforced) */}
            <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2 items-center">
                {canApprove ? (
                  <>
                    {selectedReturn.status === "pending_review" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedReturn._id, "approved")}
                          className={`px-4 py-2 rounded-xl text-xs font-black shadow-md ${t.primaryButton}`}
                        >
                          ✓ Approve Return Pickup
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedReturn._id, "rejected")}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                        >
                          ✕ Reject Claim
                        </button>
                      </>
                    )}

                    {selectedReturn.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedReturn._id, "refund_processed")}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-md ${t.primaryButton}`}
                      >
                        💳 Issue Bank Refund (₹{selectedReturn.refundAmount.toLocaleString("en-IN")})
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] opacity-70 px-3 py-1.5 rounded-lg bg-current/5 border border-current/10 italic">
                    🔒 Claim approval &amp; bank refund dispatch requires Supervisor or Admin authorization.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold opacity-75 hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

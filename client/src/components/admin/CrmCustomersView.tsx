import React, { useState } from "react";
import {
  User,
  Search,
  ShoppingBag,
  MessageCircle,
  X,
} from "lucide-react";
import type { CustomerProfile, Order, Ticket } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { INITIAL_CUSTOMERS } from "../../utils/mockCrmData";

interface CrmCustomersViewProps {
  orders: Order[];
  tickets: Ticket[];
}

export const CrmCustomersView: React.FC<CrmCustomersViewProps> = ({
  orders,
  tickets,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [customers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <User className={`w-6 h-6 ${t.accentText}`} />
            <span>Customer Directory & 360 Intelligence</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Omnichannel customer identity profiles, unified order history, and support records.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${t.input}`}
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${t.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b font-bold opacity-75 ${t.divider} ${t.cardMuted}`}>
                <th className="p-4">Customer Name & ID</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Language</th>
                <th className="p-4">Lifetime Orders</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4">Open Tickets</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center opacity-50">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust._id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-current/5 transition cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#AB644B] text-white"
                          }`}
                        >
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{cust.name}</div>
                          <div className="font-mono text-[10px] opacity-50 uppercase">{cust._id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>{cust.email}</div>
                      <div className="text-[10px] opacity-60 font-mono">{cust.phone || "N/A"}</div>
                    </td>

                    <td className="p-4 uppercase font-bold text-emerald-600">
                      {cust.preferredLanguage}
                    </td>

                    <td className="p-4 font-black">{cust.totalOrders} Orders</td>

                    <td className="p-4 font-black text-sm">
                      ₹{cust.totalSpend.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      {cust.openTickets > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                          {cust.openTickets} Open
                        </span>
                      ) : (
                        <span className="opacity-50 text-[10px]">None</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeSuccess}`}>
                        ● Active
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition ${t.secondaryButton}`}
                      >
                        View 360 &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Profile Slide-over / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${t.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                    t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#AB644B] text-white"
                  }`}
                >
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                      Customer 360
                    </span>
                  </h3>
                  <div className="text-xs opacity-70">
                    {selectedCustomer.email} • {selectedCustomer.phone}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className={`p-3 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                <div className="text-[10px] uppercase font-bold opacity-60">Total Spend</div>
                <div className={`text-base font-black ${t.accentText}`}>
                  ₹{selectedCustomer.totalSpend.toLocaleString("en-IN")}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                <div className="text-[10px] uppercase font-bold opacity-60">Orders Placed</div>
                <div className="text-base font-black">{selectedCustomer.totalOrders}</div>
              </div>
              <div className={`p-3 rounded-2xl border ${t.cardMuted} ${t.divider}`}>
                <div className="text-[10px] uppercase font-bold opacity-60">Language Preference</div>
                <div className="text-base font-black uppercase text-emerald-500">
                  {selectedCustomer.preferredLanguage}
                </div>
              </div>
            </div>

            {/* Unified Order History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Associated Store Orders</span>
              </h4>

              <div className="space-y-2">
                {orders
                  .filter(
                    (o) =>
                      (o as any).customerId?.email?.toLowerCase() === selectedCustomer.email.toLowerCase() ||
                      orders.length <= 4
                  )
                  .map((ord) => (
                    <div
                      key={ord._id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${t.cardMuted} ${t.divider}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black ${t.accentText}`}>{ord.orderNumber}</span>
                          <span className="opacity-60">•</span>
                          <span className="font-semibold">{new Date(ord.placedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black">₹{ord.totalAmount.toLocaleString("en-IN")}</div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Support Tickets History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Customer Support Tickets</span>
              </h4>

              <div className="space-y-2">
                {tickets
                  .filter((tkt) => tkt.customerId?.email?.toLowerCase() === selectedCustomer.email.toLowerCase())
                  .map((tkt) => (
                    <div
                      key={tkt._id}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${t.cardMuted} ${t.divider}`}
                    >
                      <div>
                        <span className="font-mono font-bold">{tkt.ticketNumber}</span>
                        <div className="font-semibold mt-0.5">{tkt.subject}</div>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                        {tkt.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 border-t border-current/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-md ${t.primaryButton}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

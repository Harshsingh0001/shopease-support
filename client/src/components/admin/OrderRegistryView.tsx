import React, { useState } from "react";
import {
  Truck,
  Search,
  Edit2,
} from "lucide-react";
import type { Order } from "../../types";
import { api } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface OrderRegistryViewProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

export const OrderRegistryView: React.FC<OrderRegistryViewProps> = ({
  orders,
  onRefreshOrders,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("processing");
  const [newCarrier, setNewCarrier] = useState<string>("Delhivery Express");
  const [newTracking, setNewTracking] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewCarrier(order.carrier || "Delhivery Express");
    setNewTracking(order.trackingNumber || "");
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setUpdating(true);
    try {
      await api.orders.updateStatus(editingOrder._id, {
        status: newStatus,
        carrier: newCarrier,
        trackingNumber: newTracking,
      });
      setEditingOrder(null);
      onRefreshOrders();
    } catch (err) {
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.carrier || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck className={`w-5 h-5 ${t.accentText}`} />
            <span>Platform Order Fulfillment Registry</span>
          </h1>
          <p className="text-xs opacity-75">
            Real-time warehouse order status, carrier dispatch tracking, and return monitoring.
          </p>
        </div>

        <button
          onClick={onRefreshOrders}
          className={`text-xs font-bold hover:underline ${t.accentText}`}
        >
          Refresh Orders
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${t.card}`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ORD-XXXX or tracking number..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none ${t.input}`}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {["all", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition ${
                statusFilter === st ? t.primaryButton : "opacity-60 hover:opacity-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className={`rounded-2xl border overflow-hidden ${t.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b opacity-70 font-semibold ${t.divider} ${t.cardMuted}`}>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Purchased Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Carrier & Tracking</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center opacity-50">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-current/5 transition">
                    <td className={`p-4 font-mono font-bold text-sm ${t.accentText}`}>
                      {ord.orderNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {(ord as any).customerId?.name || "Customer"}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {new Date(ord.placedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </td>
                    <td className="p-4 font-extrabold">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-mono">
                      <div>{ord.carrier || "Delhivery"}</div>
                      <div className="text-[10px] opacity-65">
                        {ord.trackingNumber || "Pending"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === "delivered"
                            ? t.badgeSuccess
                            : ord.status === "shipped"
                            ? t.badgeInfo
                            : t.badgeWarning
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(ord)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ml-auto transition ${t.secondaryButton}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${t.card}`}>
            <h3 className="font-bold text-base flex items-center justify-between">
              <span>Update Fulfillment Status</span>
              <span className={`font-mono text-xs ${t.accentText}`}>
                {editingOrder.orderNumber}
              </span>
            </h3>

            <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Carrier Partner</label>
                <input
                  type="text"
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  placeholder="e.g. Delhivery Express, Bluedart"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Tracking AWB Number</label>
                <input
                  type="text"
                  value={newTracking}
                  onChange={(e) => setNewTracking(e.target.value)}
                  placeholder="e.g. DLH82947192"
                  className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${t.input}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-2 rounded-xl opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-4 py-2 rounded-xl font-bold ${t.primaryButton}`}
                >
                  {updating ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

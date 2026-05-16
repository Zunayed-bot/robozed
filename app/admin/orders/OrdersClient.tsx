"use client";

import { useState } from "react";
import Link from "next/link";

type Order = {
  _id: string;
  orderId: string;
  customer: { fullName: string; phone: string };
  items: unknown[];
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? orders.filter((o) => {
        const q = query.trim().toLowerCase();
        return (
          o.orderId.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
        );
      })
    : orders;

  return (
    <>
      {/* Search bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", maxWidth: 380 }}>
          <svg
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Order ID or customer name…"
            className="input"
            style={{ paddingLeft: 40, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--accent)" }}>
              {["Order ID", "Customer", "Phone", "Items", "Total", "Status", "Date", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "60px 16px", textAlign: "center", color: "var(--text-light)" }}>
                  {query ? `No orders match "${query}"` : "No orders found"}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order._id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                    #{order.orderId}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text)" }}>
                    {order.customer.fullName}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                    {order.customer.phone}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                    {(order.items as unknown[]).length} item{(order.items as unknown[]).length !== 1 ? "s" : ""}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                    ৳{order.total.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-light)" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/admin/orders/${order._id}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

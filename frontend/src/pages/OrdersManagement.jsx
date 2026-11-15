// ============================================================
// 📁 pages/OrdersManagement.jsx — Orders (Overview style)
// Status filters + search + light table rows + round action buttons (English / LTR like Overview)
// ============================================================
import { useState, useEffect } from "react";
import { usePrefs } from "../context/PrefsContext";

const API      = () => import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const STATUS_CONFIG = {
  pending:   { label: "Pending", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  shipped:   { label: "Shipped",     color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  delivered: { label: "Delivered",   color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
  cancelled: { label: "Cancelled",       color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const FILTERS = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "shipped",   label: "Shipped"   },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
.od-page{
  display:flex;flex-direction:column;gap:16px;
  position:relative;border-radius:22px;padding:24px;
  border:1px solid rgba(255,255,255,.9);
  background:
    radial-gradient(520px 340px at 92% -6%, rgba(167,139,250,.55), transparent 70%),
    radial-gradient(460px 360px at -4% 105%, rgba(196,181,253,.5), transparent 70%),
    radial-gradient(380px 260px at 55% 48%, rgba(221,214,254,.45), transparent 70%),
    #faf7ff;
  box-shadow:0 10px 40px rgba(137,75,244,.10), inset 0 1px 0 rgba(255,255,255,.9);
  font-family:'Inter',sans-serif;color:#111827;
}

/* header */
.od-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.od-title{font-size:1.5rem;font-weight:700;color:#111827;line-height:1.2;margin:0;}
.od-sub{font-size:.82rem;color:#6b7280;margin:4px 0 0;}
.od-circ{
  width:42px;height:42px;border-radius:50%;
  border:1px solid rgba(255,255,255,.9);background:#fff;color:#6b7280;
  box-shadow:0 2px 10px rgba(137,75,244,.10);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:color .15s,box-shadow .15s;
}
.od-circ:hover{color:#894bf4;box-shadow:0 4px 16px rgba(137,75,244,.18);}
.od-hact{display:flex;gap:8px;align-items:center;}
.od-circ:focus-visible{outline:2px solid #894bf4;outline-offset:2px;}

/* filter chips */
.od-chips{display:flex;gap:8px;flex-wrap:wrap;}
.od-chip{
  display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 8px 0 16px;
  border:1px solid rgba(255,255,255,.9);border-radius:999px;background:#fff;
  box-shadow:0 2px 10px rgba(137,75,244,.10);
  font-family:inherit;font-size:.85rem;font-weight:600;color:#374151;cursor:pointer;
  transition:box-shadow .15s,color .15s;
}
.od-chip:hover{color:#894bf4;box-shadow:0 4px 16px rgba(137,75,244,.18);}
.od-chip:focus-visible{outline:2px solid #894bf4;outline-offset:2px;}
.od-chip__n{
  min-width:24px;height:24px;padding:0 7px;border-radius:999px;
  display:inline-flex;align-items:center;justify-content:center;
  background:#f4f1fe;color:#894bf4;font-size:.75rem;font-weight:700;
}
.od-chip.is-on,.od-chip.is-on:hover{background:#894bf4;color:#fff;box-shadow:0 4px 14px rgba(137,75,244,.28);}
.od-chip.is-on .od-chip__n{background:rgba(255,255,255,.25);color:#fff;}

/* search */
.od-search{
  display:flex;align-items:center;gap:10px;height:44px;padding:0 18px;
  border:1px solid rgba(255,255,255,.9);border-radius:999px;background:#fff;
  box-shadow:0 2px 10px rgba(137,75,244,.10);color:#9ca3af;
}
.od-search:focus-within{box-shadow:0 0 0 2px #894bf4;}
.od-search input{
  flex:1;min-width:0;border:none;outline:none;background:transparent;
  font-family:inherit;font-size:.85rem;color:#111827;
}
.od-search input::placeholder{color:#9ca3af;}

/* table card */
.od-card{
  background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.85);border-radius:18px;
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  box-shadow:0 4px 20px rgba(137,75,244,.07);overflow:hidden;
}
.od-scroll{overflow-x:auto;}
.od-grid{min-width:780px;}
.od-row{
  display:grid;grid-template-columns:1.5fr 1.5fr .8fr .9fr 1fr 1.1fr;
  gap:12px;align-items:center;padding:12px 20px;font-size:.84rem;
}
.od-row + .od-row{border-top:1px solid #f1ecfd;}
.od-row--head{font-size:.75rem;color:#9ca3af;font-weight:600;padding:14px 20px 10px;}
.od-row:not(.od-row--head):hover{background:rgba(244,241,254,.55);}

.od-cust{display:flex;align-items:center;gap:10px;min-width:0;}
.od-av{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  background:#ede9ff;color:#894bf4;font-weight:700;font-size:.9rem;
  display:flex;align-items:center;justify-content:center;
}
.od-name{font-weight:600;color:#111827;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.od-phone{font-size:.74rem;color:#9ca3af;margin:2px 0 0;direction:ltr;text-align:left;}
.od-items{display:flex;flex-direction:column;gap:3px;min-width:0;}
.od-item{color:#374151;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.od-item small{color:#9ca3af;font-size:.74rem;}
.od-var{color:#894bf4;font-size:.72rem;font-weight:600;}
.od-city{color:#894bf4;font-weight:600;}
.od-addr{color:#9ca3af;font-size:.72rem;margin:2px 0 0;}
.od-price{font-weight:700;color:#10b981;white-space:nowrap;}

.od-badge{
  display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;
  border-radius:999px;border:1px solid;font-size:.72rem;font-weight:700;white-space:nowrap;
  width:fit-content;
}
.od-badge i{width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;}

.od-acts{display:flex;gap:6px;align-items:center;}
.od-ib{
  width:34px;height:34px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  background:#fff;border:1px solid #ebe7f7;color:#6b7280;
  transition:background .15s,color .15s,border-color .15s;
}
.od-ib:focus-visible{outline:2px solid #894bf4;outline-offset:2px;}
.od-ib--go{background:#894bf4;border-color:#894bf4;color:#fff;}
.od-ib--go:hover{background:#7c3aed;border-color:#7c3aed;}
.od-ib--no{color:#ef4444;}
.od-ib--no:hover{background:#fef2f2;border-color:#fecaca;}
.od-ib--view:hover{background:#f4f1fe;border-color:#e0d2fa;color:#894bf4;}

/* details modal */
.od-ov{
  position:fixed;inset:0;z-index:200;padding:16px;
  background:rgba(17,24,39,.35);
  display:flex;align-items:center;justify-content:center;
}
.od-modal{
  width:min(460px,100%);max-height:90vh;overflow-y:auto;
  background:#fff;border-radius:24px;padding:22px;
  box-shadow:0 20px 60px rgba(137,75,244,.22);
}
.od-modal__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.od-modal__title{font-size:1.1rem;font-weight:700;margin:0;color:#111827;}
.od-dl{display:flex;flex-direction:column;}
.od-dl__row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;font-size:.85rem;}
.od-dl__row + .od-dl__row{border-top:1px solid #f1ecfd;}
.od-dl__k{color:#9ca3af;flex-shrink:0;}
.od-dl__v{color:#111827;font-weight:600;text-align:right;min-width:0;overflow-wrap:anywhere;}
.od-dl__v--ltr{direction:ltr;}

.od-foot{border-top:1px solid #f1ecfd;padding:12px 20px;font-size:.75rem;color:#9ca3af;}
.od-foot strong{color:#374151;}
.od-empty{padding:48px 20px;text-align:center;color:#9ca3af;font-size:.9rem;}

@media (max-width:768px){
  .od-page{padding:14px;border-radius:16px;}
}
`;

// ── Icons ──────────────────────────────────────────────────────
const ico = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
const IconRefresh = () => (
  <svg width="18" height="18" {...ico}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" {...ico}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconShip = () => (
  <svg width="16" height="16" {...ico}>
    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconCheck = () => (<svg width="16" height="16" {...ico} strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>);
const IconDownload = () => (
  <svg width="18" height="18" {...ico}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" {...ico}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconX     = () => (<svg width="16" height="16" {...ico} strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);

// نص المنتجات لسطر واحد (للتصدير والتفاصيل)
const itemsText = (o) =>
  o.items?.length > 0
    ? o.items.map(it => `${it.name} x${it.quantity}${(it.color || it.size) ? ` (${[it.color, it.size].filter(Boolean).join(" / ")})` : ""}`).join(" | ")
    : (o.productId?.name || "");

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const StatusBadge = ({ status, t }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
  return (
    <span className="od-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <i />
      {t(cfg.label)}
    </span>
  );
};

const OrdersManagement = () => {
  const { t } = usePrefs();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [notif,   setNotif]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [query,   setQuery]   = useState("");
  const [detail,  setDetail]  = useState(null);   // الطلب المعروض في نافذة التفاصيل

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API()}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch { setError("Failed to load orders ❌"); }
    finally  { setLoading(false); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API()}/api/orders/update-status/${orderId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.message || "Something went wrong ❌", "error");
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      notify("Status updated ✅");
    } catch { notify("Connection error ❌", "error"); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Escape يسكر نافذة التفاصيل
  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p>{t("Loading orders...")}</p>
    </div>
  );

  if (error) return (
    <div className="pp-empty">
      <span>⚠️</span>
      <p style={{ color: "#ef4444" }}>{t(error)}</p>
      <button className="pp-btn pp-btn--primary" onClick={fetchOrders}>{t("Try again")}</button>
    </div>
  );

  // عدّادات الفلاتر
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    shipped:   orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  // فلترة + بحث
  const q = query.trim().toLowerCase();
  const visible = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!q) return true;
    const hay = [
      o.customerName,
      o.phone,
      o.shippingCity,
      o.productId?.name,
      ...(o.items || []).map(it => it.name),
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });

  // تصدير الطلبات الظاهرة (حسب الفلتر والبحث) إلى CSV
  const exportCsv = () => {
    if (visible.length === 0) return notify("No orders to export ❌", "error");
    const head = ["Customer", "Phone", "Product", "Wilaya", "Address", "Amount (DA)", "Status", "Date"];
    const rows = visible.map(o => [
      o.customerName, o.phone, itemsText(o), o.shippingCity, o.address,
      o.totalPrice || 0,
      STATUS_CONFIG[o.status]?.label || o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleString("en-GB") : "",
    ]);
    const csv = "\uFEFF" + [head, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    notify("Orders exported ✅");
  };

  return (
    <div className="od-page" dir="ltr">
      <style>{CSS}</style>

      {/* Toast */}
      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div className="od-head">
        <div>
          <h1 className="od-title">{t("Orders")}</h1>
          <p className="od-sub">{t("Track and manage your store orders.")}</p>
        </div>
        <div className="od-hact">
          <button className="od-circ" onClick={fetchOrders} title={t("Refresh")} aria-label={t("Refresh")}>
            <IconRefresh />
          </button>
          <button className="od-circ" onClick={exportCsv} title={t("Export")} aria-label={t("Export")}>
            <IconDownload />
          </button>
        </div>
      </div>

      {/* ══ FILTER CHIPS ══ */}
      <div className="od-chips" role="tablist" aria-label={t("Filter by status")}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`od-chip${filter === f.key ? " is-on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {t(f.label)}
            <span className="od-chip__n">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* ══ SEARCH ══ */}
      <label className="od-search">
        <IconSearch />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("Search by customer, phone, product or wilaya")}
        />
      </label>

      {/* ══ TABLE ══ */}
      <div className="od-card">
        {visible.length === 0 ? (
          <div className="od-empty">
            {orders.length === 0 ? t("No orders yet") : t("No matching orders")}
          </div>
        ) : (
          <div className="od-scroll">
            <div className="od-grid">
              <div className="od-row od-row--head">
                {["Customer", "Product", "Wilaya", "Amount", "Status", "Actions"].map(h => (
                  <span key={h}>{t(h)}</span>
                ))}
              </div>

              {visible.map(order => (
                <div className="od-row" key={order._id}>

                  {/* الزبون + الهاتف */}
                  <div className="od-cust">
                    <span className="od-av">{order.customerName?.charAt(0).toUpperCase()}</span>
                    <div style={{ minWidth: 0 }}>
                      <p className="od-name">{order.customerName}</p>
                      <p className="od-phone">{order.phone}</p>
                    </div>
                  </div>

                  {/* المنتج — items كاملين مع اللون/المقاس */}
                  <div className="od-items">
                    {order.items?.length > 0 ? (
                      order.items.map((it, idx) => (
                        <span key={idx} className="od-item">
                          {it.name} <small>×{it.quantity}</small>
                          {(it.color || it.size) && (
                            <span className="od-var"> ({[it.color, it.size].filter(Boolean).join(" · ")})</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="od-item">
                        {order.productId?.name || <span style={{ color: "#fca5a5", fontSize: ".75rem" }}>{t("Deleted product")}</span>}
                      </span>
                    )}
                  </div>

                  {/* الولاية */}
                  <div>
                    <span className="od-city">{order.shippingCity || "—"}</span>
                    {order.address && <p className="od-addr">{order.address}</p>}
                  </div>

                  {/* المبلغ */}
                  <span className="od-price">{(order.totalPrice || 0).toLocaleString("en-US")} DA</span>

                  {/* الحالة */}
                  <StatusBadge status={order.status} t={t} />

                  {/* الإجراءات */}
                  <div className="od-acts">
                    <button className="od-ib od-ib--view" title={t("View details")} aria-label={t("View details")}
                      onClick={() => setDetail(order)}>
                      <IconEye />
                    </button>
                    {order.status === "pending" && (
                      <button className="od-ib od-ib--go" title={t("Ship")} aria-label={t("Ship")}
                        onClick={() => handleUpdateStatus(order._id, "shipped")}>
                        <IconShip />
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button className="od-ib od-ib--go" title={t("Mark delivered")} aria-label={t("Mark delivered")}
                        onClick={() => handleUpdateStatus(order._id, "delivered")}>
                        <IconCheck />
                      </button>
                    )}
                    {(order.status === "pending" || order.status === "shipped") && (
                      <button className="od-ib od-ib--no" title={t("Cancel order")} aria-label={t("Cancel order")}
                        onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                        <IconX />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        <div className="od-foot">
          {t("Showing")} <strong>{visible.length}</strong> {t("of")} <strong>{orders.length}</strong> {t("orders")}
        </div>
      </div>

      {/* ══ DETAILS MODAL ══ */}
      {detail && (
        <div className="od-ov" onClick={() => setDetail(null)}>
          <div className="od-modal" role="dialog" aria-modal="true" aria-label={t("Order details")} onClick={e => e.stopPropagation()}>
            <div className="od-modal__head">
              <h2 className="od-modal__title">{t("Order details")}</h2>
              <button className="od-circ" style={{ width: 36, height: 36 }} onClick={() => setDetail(null)} title={t("Close")} aria-label={t("Close")}>
                <IconX />
              </button>
            </div>
            <div className="od-dl">
              <div className="od-dl__row"><span className="od-dl__k">{t("Customer")}</span><span className="od-dl__v">{detail.customerName}</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Phone")}</span><span className="od-dl__v od-dl__v--ltr">{detail.phone}</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Wilaya")}</span><span className="od-dl__v">{detail.shippingCity || "—"}</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Address")}</span><span className="od-dl__v">{detail.address || "—"}</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Product")}</span><span className="od-dl__v">{itemsText(detail) || "—"}</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Amount")}</span><span className="od-dl__v" style={{ color: "#10b981" }}>{(detail.totalPrice || 0).toLocaleString("en-US")} DA</span></div>
              <div className="od-dl__row"><span className="od-dl__k">{t("Status")}</span><StatusBadge status={detail.status} t={t} /></div>
              {detail.createdAt && (
                <div className="od-dl__row"><span className="od-dl__k">{t("Date")}</span><span className="od-dl__v">{new Date(detail.createdAt).toLocaleString("en-GB")}</span></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
// ============================================================
// 📁 pages/OverviewPage.jsx  — Day 19
// الصفحة الرئيسية للداشبورد: Stats + Charts + آخر الطلبات
// تصميم مستوحى من Tassyir
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const token = () => localStorage.getItem("token");
const API   = () => import.meta.env.VITE_API_URL;

// ── helpers ──────────────────────────────────────────────
// يحوّل قائمة الطلبات لبيانات chart يومية (آخر 7 أيام)
function buildChartData(orders) {
  const days = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d     = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const key   = d.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const dayOrders = orders.filter(
      (o) => new Date(o.createdAt).toLocaleDateString("en-CA") === key
    );

    result.push({
      date:     label,
      orders:   dayOrders.length,
      revenue:  dayOrders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalPrice || 0), 0),
      profit:   dayOrders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalPrice || 0) * 0.8, 0), // تقديري 80%
    });
  }
  return result;
}

// ── StatCard ──────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="ov-stat">
      <span className="ov-stat__label">{label}</span>
      <span className="ov-stat__value">{value}</span>
      {sub && <span className="ov-stat__sub">{sub}</span>}
    </div>
  );
}

// ── ChartCard ─────────────────────────────────────────────
function ChartCard({ title, value, trend, trendUp, children }) {
  return (
    <div className="ov-chart">
      <div className="ov-chart__header">
        <div>
          <p className="ov-chart__title">{title}</p>
          <p className="ov-chart__value">{value}</p>
        </div>
        {trend !== undefined && (
          <span className={`ov-chart__trend ${trendUp ? "ov-chart__trend--up" : "ov-chart__trend--down"}`}>
            {trendUp ? "↗" : "↘"} {trend}%
          </span>
        )}
      </div>
      <div className="ov-chart__body">{children}</div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────
const STATUS = {
  pending:   { label: "معلق",    cls: "badge-amber" },
  shipped:   { label: "مشحون",   cls: "badge-blue"  },
  delivered: { label: "موصّل",   cls: "badge-green" },
  cancelled: { label: "ملغي",    cls: "badge-red"   },
};
function Badge({ status }) {
  const s = STATUS[status] || { label: status, cls: "badge-gray" };
  return <span className={`ov-badge ${s.cls}`}>{s.label}</span>;
}

// ── MAIN ─────────────────────────────────────────────────
function OverviewPage() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({
    totalProducts: 0, totalOrders: 0,
    pendingOrders: 0, totalRevenue: 0, cancelledOrders: 0,
  });
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState("7d"); // "24h" | "7d" | "30d"

  // جلب البيانات
  useEffect(() => {
    const t = token();
    if (!t) return navigate("/login");

    Promise.all([
      fetch(`${API()}/api/orders/analytics`,  { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API()}/api/orders/my-orders`,  { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
    ])
      .then(([analyticsData, ordersData]) => {
        if (analyticsData && !analyticsData.message) setAnalytics(analyticsData);
        if (Array.isArray(ordersData)) setOrders(ordersData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // حسابات مشتقة
  const cancellationRate = analytics.totalOrders > 0
    ? Math.round((analytics.cancelledOrders / analytics.totalOrders) * 100)
    : 0;
  const confirmedOrders = analytics.totalOrders
    - analytics.pendingOrders
    - analytics.cancelledOrders;

  // بيانات الـ charts
  const chartData = buildChartData(orders);
  const totalSales  = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = chartData.reduce((s, d) => s + d.profit,  0);
  const totalChartOrders = chartData.reduce((s, d) => s + d.orders, 0);

  if (loading) {
    return (
      <div className="ov-loading">
        <div className="ov-loading__spinner" />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="ov-page">

      {/* ── Period Tabs ── */}
      <div className="ov-period-tabs">
        {[
          { key: "24h", label: "Last 24h"   },
          { key: "7d",  label: "Last 7 Days" },
          { key: "30d", label: "Last 30 Days"},
        ].map((p) => (
          <button
            key={p.key}
            className={`ov-period-btn ${period === p.key ? "ov-period-btn--active" : ""}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Stats Row ── */}
      <div className="ov-stats-row">
        <StatCard label="Total orders"     value={analytics.totalOrders}  />
        <StatCard label="Confirmed Orders" value={confirmedOrders}         />
        <StatCard label="Processing Orders" value={analytics.pendingOrders} />
        <StatCard label="Cancelled Orders" value={analytics.cancelledOrders}
          sub={analytics.totalOrders > 0 ? `${cancellationRate}%` : undefined} />
      </div>

      {/* ── Charts Row ── */}
      <div className="ov-charts-row">

        {/* Total Sales */}
        <ChartCard
          title="Total Sales"
          value={`DZD ${totalSales.toLocaleString()}`}
          trend={0}
          trendUp={true}
        >
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v.toLocaleString()} DA`, "المبيعات"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2}
                fill="url(#salesGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Net Profit */}
        <ChartCard
          title="Net Profit"
          value={`DZD ${Math.round(totalProfit).toLocaleString()}`}
          trend={0}
          trendUp={true}
        >
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v.toLocaleString()} DA`, "الربح"]}
              />
              <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2}
                fill="url(#profitGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orders Bar */}
        <ChartCard
          title="Orders"
          value={totalChartOrders}
          trend={cancellationRate}
          trendUp={cancellationRate === 0}
        >
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                allowDecimals={false}/>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [v, "الطلبات"]}
              />
              <Bar dataKey="orders" fill="#111827" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* ── Recent Orders ── */}
      <div className="ov-recent">
        <div className="ov-recent__header">
          <h3 className="ov-recent__title">آخر الطلبات</h3>
          <button
            className="ov-recent__link"
            onClick={() => navigate("/dashboard/orders")}
          >
            عرض الكل ←
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="ov-empty">
            <span>🛒</span>
            <p>لا توجد طلبات بعد</p>
          </div>
        ) : (
          <table className="ov-table">
            <thead>
              <tr>
                <th>الزبون</th>
                <th>المنتج</th>
                <th>الولاية</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o._id}>
                  <td>
                    <div className="ov-table__customer">
                      <span className="ov-table__avatar">
                        {o.customerName?.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="ov-table__name">{o.customerName}</p>
                        <p className="ov-table__phone">{o.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="ov-table__product">
                    {o.productId?.name || "منتج محذوف"}
                  </td>
                  <td className="ov-table__city">{o.shippingCity || "—"}</td>
                  <td className="ov-table__price">
                    {(o.totalPrice || 0).toLocaleString()} DA
                  </td>
                  <td><Badge status={o.status} /></td>
                  <td className="ov-table__date">
                    {new Date(o.createdAt).toLocaleDateString("en-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default OverviewPage;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const style = document.createElement("style");
style.textContent = `
/* ── Loading ── */
.ov-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 300px; gap: 16px;
  color: #6b7280; font-size: .9rem;
}
.ov-loading__spinner {
  width: 32px; height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #111827;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Page ── */
.ov-page {
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Period Tabs ── */
.ov-period-tabs {
  display: flex; gap: 6px;
}
.ov-period-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-size: .82rem; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: all .15s;
}
.ov-period-btn:hover { border-color: #111827; color: #111827; }
.ov-period-btn--active {
  background: #111827; color: #fff; border-color: #111827;
}

/* ── Stats Row ── */
.ov-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.ov-stat {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 6px;
}
.ov-stat__label {
  font-size: .78rem; color: #6b7280; font-weight: 500;
}
.ov-stat__value {
  font-size: 1.8rem; font-weight: 700; color: #111827;
  line-height: 1;
}
.ov-stat__sub {
  font-size: .75rem; color: #ef4444; font-weight: 500;
}

/* ── Charts Row ── */
.ov-charts-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.ov-chart {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px 20px 14px;
}
.ov-chart__header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 16px;
}
.ov-chart__title {
  font-size: .78rem; color: #6b7280; font-weight: 500; margin-bottom: 4px;
}
.ov-chart__value {
  font-size: 1.4rem; font-weight: 700; color: #111827;
}
.ov-chart__trend {
  font-size: .75rem; font-weight: 600;
  padding: 3px 8px; border-radius: 99px;
}
.ov-chart__trend--up   { background: #f0fdf4; color: #10b981; }
.ov-chart__trend--down { background: #fef2f2; color: #ef4444; }
.ov-chart__body { width: 100%; }

/* ── Recent Orders ── */
.ov-recent {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px 24px;
}
.ov-recent__header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 16px;
}
.ov-recent__title {
  font-size: 1rem; font-weight: 600; color: #111827;
}
.ov-recent__link {
  font-size: .82rem; color: #6b7280;
  background: none; border: none; cursor: pointer;
  font-family: inherit; transition: color .15s;
}
.ov-recent__link:hover { color: #111827; }

/* ── Table ── */
.ov-table {
  width: 100%; border-collapse: collapse;
  font-size: .82rem;
}
.ov-table th {
  text-align: right; padding: 8px 12px;
  color: #9ca3af; font-weight: 500; font-size: .75rem;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}
.ov-table td {
  padding: 12px 12px;
  border-bottom: 1px solid #f9fafb;
  color: #374151; vertical-align: middle;
}
.ov-table tr:last-child td { border-bottom: none; }
.ov-table tr:hover td { background: #fafafa; }

.ov-table__customer { display: flex; align-items: center; gap: 10px; }
.ov-table__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #111827; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700; flex-shrink: 0;
}
.ov-table__name  { font-weight: 500; color: #111827; font-size: .82rem; }
.ov-table__phone { color: #9ca3af; font-size: .75rem; }
.ov-table__product { color: #374151; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-table__city  { color: #6b7280; }
.ov-table__price { font-weight: 600; color: #111827; white-space: nowrap; }
.ov-table__date  { color: #9ca3af; white-space: nowrap; font-size: .78rem; }

/* ── Badges ── */
.ov-badge {
  display: inline-block; padding: 3px 10px;
  border-radius: 99px; font-size: .72rem; font-weight: 600;
  white-space: nowrap;
}
.badge-amber { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.badge-blue  { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.badge-green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge-red   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-gray  { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }

/* ── Empty ── */
.ov-empty {
  text-align: center; padding: 40px;
  color: #9ca3af; display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}
.ov-empty span { font-size: 2.5rem; opacity: .4; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .ov-stats-row  { grid-template-columns: repeat(2, 1fr); }
  .ov-charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .ov-stats-row { grid-template-columns: 1fr 1fr; }
  .ov-table th:nth-child(3),
  .ov-table td:nth-child(3),
  .ov-table th:nth-child(6),
  .ov-table td:nth-child(6) { display: none; }
}
`;
if (!document.getElementById("ov-styles")) {
  style.id = "ov-styles";
  document.head.appendChild(style);
}
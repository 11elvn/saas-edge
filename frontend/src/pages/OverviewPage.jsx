// ============================================================
// 📁 pages/OverviewPage.jsx
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALGERIAN_CITIES } from "../constants/algerianCities";
import { ALGERIA_MAP } from "../constants/algeriaMap";

const getToken = () => localStorage.getItem("token");
const getAPI   = () => import.meta.env.VITE_API_URL;

const HOUR = 3600 * 1000;
const DAY  = 24 * HOUR;

const PERIODS = [
  { key: "24h", label: "Last 24h", count: 24, step: HOUR },
  { key: "7d",  label: "Last 7 days",  count: 7,  step: DAY  },
  { key: "30d", label: "Last 30 days",  count: 30, step: DAY  },
];

const CITY_BY_ID = ALGERIA_MAP.names;
const ID_BY_NAME = {
  ...Object.fromEntries(ALGERIAN_CITIES.map((c) => [c.name, c.id])),
  "الجزائر": "16",
  "المسيلة": "28",
  "توقرت":   "55",
};

// ── CSS ───────────────────────────────────────────────────
const ovStyles = `
.ov-loading{
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;height:300px;gap:16px;color:#6b7280;font-size:.9rem;
}
.ov-loading__spinner{
  width:32px;height:32px;border:3px solid #f0f0f0;
  border-top-color:#894bf4;border-radius:50%;animation:ov-spin .7s linear infinite;
}
@keyframes ov-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.ov-loading__spinner{animation-duration:2s}}

.ov-page{display:flex;flex-direction:column;gap:20px;}
.ov-num{direction:ltr;unicode-bidi:isolate;display:inline-block;}

.ov-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.ov-head__title{font-size:1.5rem;font-weight:700;color:#2e1065;line-height:1.2;}
.ov-head__date{font-size:.82rem;color:#7c6aa8;margin-top:4px;}
.ov-tabs{display:inline-flex;gap:2px;padding:3px;background:#f1ecff;border-radius:10px;}
.ov-tab{
  padding:7px 14px;border:none;border-radius:8px;background:transparent;
  color:#6b7280;font-size:.8rem;font-weight:500;cursor:pointer;
  font-family:inherit;transition:background .15s,color .15s;white-space:nowrap;
}
.ov-tab:hover{color:#4c1d95;}
.ov-tab:focus-visible{outline:2px solid #894bf4;outline-offset:1px;}
.ov-tab--active,.ov-tab--active:hover{background:#894bf4;color:#fff;}

.ov-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
.ov-stat{
  background:#fff;border:1px solid #ece6fb;border-radius:14px;
  padding:18px 20px;display:flex;flex-direction:column;gap:8px;min-width:0;
}
.ov-stat__label{font-size:.8rem;color:#6b7280;font-weight:500;}
.ov-stat__value{font-size:1.75rem;font-weight:700;color:#3b1a7a;line-height:1.1;white-space:nowrap;}
.ov-stat__unit{font-size:.8rem;font-weight:600;color:#9ca3af;margin-inline-start:4px;}
.ov-stat__foot{display:flex;align-items:center;gap:6px;font-size:.74rem;color:#9ca3af;flex-wrap:wrap;}
.ov-delta{
  display:inline-flex;align-items:center;gap:2px;padding:2px 8px;
  border-radius:99px;font-weight:600;font-size:.72rem;
}
.ov-delta--good{background:#ecfdf5;color:#059669;}
.ov-delta--bad{background:#fef2f2;color:#dc2626;}
.ov-delta--flat{background:#f3f4f6;color:#6b7280;}

.ov-main{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:16px;align-items:stretch;}
.ov-card{
  background:#fff;border:1px solid #ece6fb;border-radius:14px;
  padding:16px 18px;display:flex;flex-direction:column;min-width:0;
}
.ov-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;}
.ov-card__title{font-size:.82rem;font-weight:500;color:#6b7280;margin-bottom:4px;}
.ov-card__big{font-size:1.35rem;font-weight:700;color:#3b1a7a;line-height:1.1;}
.ov-card__hint{font-size:.74rem;color:#9ca3af;}

.ov-trend__plot{position:relative;flex:1;min-height:150px;display:flex;align-items:center;}
.ov-trend__svg{width:100%;height:auto;display:block;direction:ltr;touch-action:pan-y;}
.ov-trend__grid{stroke:#f1ecff;stroke-width:1;}
.ov-trend__axis{font-size:11px;fill:#9ca3af;font-family:inherit;}
.ov-trend__line{fill:none;stroke:#7c3aed;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
.ov-trend__guide{stroke:#894bf4;stroke-width:1;stroke-dasharray:3 3;opacity:.5;}
.ov-trend__dot{fill:#fff;stroke:#894bf4;stroke-width:2.5;}
.ov-trend__tip{
  position:absolute;top:0;pointer-events:none;background:#111827;color:#fff;
  border-radius:8px;padding:7px 10px;font-size:.74rem;line-height:1.5;white-space:nowrap;z-index:2;
}
.ov-trend__tip b{font-weight:700;}
.ov-trend__tip span{color:#c4c9d4;}
.ov-trend__empty{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  color:#9ca3af;font-size:.82rem;pointer-events:none;padding-bottom:28px;
}
.ov-trend__sum{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;
  margin-top:10px;padding-top:12px;border-top:1px solid #f1f2f4;
}
.ov-trend__sum-label{font-size:.74rem;color:#9ca3af;margin-bottom:2px;}
.ov-trend__sum-value{font-size:.95rem;font-weight:600;color:#3b1a7a;}

.ov-map__wrap{position:relative;display:flex;justify-content:center;}
.ov-map__svg{width:100%;max-width:270px;height:auto;display:block;}
.ov-map__path{stroke:#fff;stroke-width:.9;transition:fill .15s;cursor:pointer;}
.ov-map__hl{fill:none;stroke:#4c1d95;stroke-width:1.8;pointer-events:none;stroke-linejoin:round;}
.ov-map__tip{
  position:absolute;pointer-events:none;background:#111827;color:#fff;
  border-radius:8px;padding:7px 10px;font-size:.74rem;line-height:1.5;
  white-space:nowrap;transform:translate(-50%,-125%);z-index:2;
}
.ov-map__tip b{font-weight:700;}
.ov-map__tip span{color:#c4c9d4;}
.ov-map__legend{display:flex;align-items:center;gap:8px;font-size:.72rem;color:#9ca3af;margin:6px 0 4px;}
.ov-map__ramp{flex:1;height:6px;border-radius:99px;background:linear-gradient(to left,#4c1d95,#d9ccff);}
.ov-top{list-style:none;display:flex;flex-direction:column;gap:8px;margin-top:10px;padding-top:12px;border-top:1px solid #f1f2f4;}
.ov-top__row{display:grid;grid-template-columns:96px minmax(0,1fr) auto;align-items:center;gap:10px;font-size:.8rem;}
.ov-top__name{color:#374151;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ov-top__bar{height:6px;border-radius:99px;background:#f1f2f4;overflow:hidden;}
.ov-top__fill{height:100%;border-radius:99px;background:#894bf4;}
.ov-top__count{color:#111827;font-weight:600;min-width:20px;text-align:end;}
.ov-top__empty{font-size:.8rem;color:#9ca3af;text-align:center;padding:6px 0;}

@media(max-width:1180px){
  .ov-main{grid-template-columns:minmax(0,1fr);}
}
@media(max-width:1024px){
  .ov-stats{grid-template-columns:repeat(2,minmax(0,1fr));}
}
@media(max-width:520px){
  .ov-stats{gap:10px;}
  .ov-stat{padding:14px;}
  .ov-stat__value{font-size:1.4rem;}
  .ov-card{padding:16px;}
  .ov-trend__sum{grid-template-columns:1fr 1fr;}
  .ov-top__row{grid-template-columns:80px minmax(0,1fr) auto;}
}
`;

// ── Helpers ───────────────────────────────────────────────
const fmt = (n) => Math.round(n || 0).toLocaleString("en-US");

function buildBuckets(period, nowMs) {
  const base = new Date(nowMs);
  if (period.step === HOUR) base.setMinutes(0, 0, 0);
  else base.setHours(0, 0, 0, 0);
  const lastStart = base.getTime();

  const buckets = [];
  for (let i = period.count - 1; i >= 0; i--) {
    let start;
    if (period.step === HOUR) {
      start = lastStart - i * HOUR;
    } else {
      const d = new Date(lastStart);
      d.setDate(d.getDate() - i);
      start = d.getTime();
    }
    const d = new Date(start);
    const label = period.step === HOUR
      ? `${String(d.getHours()).padStart(2, "0")}:00`
      : `${d.getDate()}/${d.getMonth() + 1}`;
    buckets.push({ start, label, sales: 0, orders: 0 });
  }
  return { buckets, from: buckets[0].start, to: lastStart + period.step };
}

function summarise(orders, from, to) {
  const s = { orders: 0, pending: 0, cancelled: 0, delivered: 0, sales: 0 };
  for (const o of orders) {
    const t = new Date(o.createdAt).getTime();
    if (t < from || t >= to) continue;
    s.orders += 1;
    if (o.status === "pending")   s.pending += 1;
    if (o.status === "cancelled") s.cancelled += 1;
    if (o.status === "delivered") { s.delivered += 1; s.sales += o.totalPrice || 0; }
  }
  return s;
}

function makeDelta(cur, prev, invert = false) {
  if (prev === 0 && cur === 0) return null;
  if (prev === 0) return { text: "New", tone: invert ? "bad" : "good", arrow: "↑" };
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return { text: "0%", tone: "flat", arrow: "" };
  const up = pct > 0;
  return {
    text:  `${Math.abs(pct)}%`,
    tone:  (up !== invert) ? "good" : "bad",
    arrow: up ? "↑" : "↓",
  };
}

function niceScale(max) {
  if (max <= 0) return { max: 1000, step: 250 };
  const raw = max / 4;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f   = raw / exp;
  const nf  = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  const step = nf * exp;
  return { max: step * 4, step };
}

const compact = (v) => {
  if (v >= 1e6) return `${+(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${+(v / 1e3).toFixed(2)}k`;
  return `${v}`;
};

function monotonePath(pts) {
  const n = pts.length;
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;
  const dx = [], m = [], t = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    m[i]  = (pts[i + 1].y - pts[i].y) / dx[i];
  }
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      t[i] = tau * a * m[i];
      t[i + 1] = tau * b * m[i];
    }
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i].x + dx[i] / 3;
    const c1y = pts[i].y + (t[i] * dx[i]) / 3;
    const c2x = pts[i + 1].x - dx[i] / 3;
    const c2y = pts[i + 1].y - (t[i + 1] * dx[i]) / 3;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, unit, delta, note }) {
  return (
    <div className="ov-stat">
      <span className="ov-stat__label">{label}</span>
      <span className="ov-stat__value">
        <span className="ov-num">{value}</span>
        {unit && <span className="ov-stat__unit">{unit}</span>}
      </span>
      <div className="ov-stat__foot">
        {delta && (
          <span className={`ov-delta ov-delta--${delta.tone}`}>
            {delta.arrow && <span>{delta.arrow}</span>}
            <span className="ov-num">{delta.text}</span>
          </span>
        )}
        <span>{note}</span>
      </div>
    </div>
  );
}

// ── Sales Trend ───────────────────────────────────────────
function SalesTrend({ buckets, totalSales, deliveredCount, periodLabel }) {
  const W = 640, H = 190;
  const PL = 44, PR = 12, PT = 10, PB = 26;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;

  const [hover, setHover] = useState(null);

  const maxVal = Math.max(...buckets.map((b) => b.sales), 0);
  const { max: yMax, step } = niceScale(maxVal);
  const n = buckets.length;

  const pts = buckets.map((b, i) => ({
    x: PL + (i / (n - 1)) * plotW,
    y: PT + plotH - (b.sales / yMax) * plotH,
  }));

  const line = monotonePath(pts);
  const area = `${line} L${pts[n - 1].x},${PT + plotH} L${pts[0].x},${PT + plotH} Z`;

  const labelEvery = Math.ceil(n / 6);
  const best = buckets.reduce((a, b) => (b.sales > a.sales ? b : a), buckets[0]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((x - PL) / plotW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, idx)));
  };

  const tipLeft = hover === null ? 0 : Math.max(14, Math.min(86, (pts[hover].x / W) * 100));

  return (
    <div className="ov-card">
      <div className="ov-card__head">
        <div>
          <p className="ov-card__title">Sales trend</p>
          <p className="ov-card__big"><span className="ov-num">{fmt(totalSales)}</span> DA</p>
        </div>
        <span className="ov-card__hint">{periodLabel} · Delivered orders</span>
      </div>

      <div className="ov-trend__plot">
        <svg
          className="ov-trend__svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Sales trend"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="ov-trend-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#894bf4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#894bf4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((i) => {
            const y = PT + plotH - (i / 4) * plotH;
            return (
              <g key={i}>
                <line className="ov-trend__grid" x1={PL} x2={W - PR} y1={y} y2={y} />
                <text className="ov-trend__axis" x={PL - 8} y={y + 4} textAnchor="end">
                  {compact(step * i)}
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#ov-trend-grad)" />
          <path d={line} className="ov-trend__line" />

          {buckets.map((b, i) =>
            i % labelEvery === 0 ? (
              <text key={i} className="ov-trend__axis" x={pts[i].x} y={H - 7} textAnchor="middle">
                {b.label}
              </text>
            ) : null
          )}

          {hover !== null && (
            <g>
              <line className="ov-trend__guide" x1={pts[hover].x} x2={pts[hover].x} y1={PT} y2={PT + plotH} />
              <circle className="ov-trend__dot" cx={pts[hover].x} cy={pts[hover].y} r="4.5" />
            </g>
          )}
        </svg>

        {maxVal === 0 && <div className="ov-trend__empty">No sales in this period</div>}

        {hover !== null && (
          <div className="ov-trend__tip" style={{ left: `${tipLeft}%`, transform: "translateX(-50%)" }}>
            <span>{buckets[hover].label}</span><br />
            <b><span className="ov-num" style={{ color: "#fff" }}>{fmt(buckets[hover].sales)}</span> DA</b><br />
            <span><span className="ov-num">{buckets[hover].orders}</span> orders</span>
          </div>
        )}
      </div>

      <div className="ov-trend__sum">
        <div>
          <p className="ov-trend__sum-label">Delivered orders</p>
          <p className="ov-trend__sum-value"><span className="ov-num">{deliveredCount}</span></p>
        </div>
        <div>
          <p className="ov-trend__sum-label">Average order value</p>
          <p className="ov-trend__sum-value">
            <span className="ov-num">{deliveredCount > 0 ? fmt(totalSales / deliveredCount) : "—"}</span>
            {deliveredCount > 0 && " DA"}
          </p>
        </div>
        <div>
          <p className="ov-trend__sum-label">Peak</p>
          <p className="ov-trend__sum-value">
            <span className="ov-num">{best.sales > 0 ? best.label : "—"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Algeria Map ───────────────────────────────────────────
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
function shade(count, max) {
  if (!count || max <= 0) return "#efeafd";
  const t = Math.sqrt(count / max);
  return `rgb(${lerp(217, 76, t)},${lerp(204, 29, t)},${lerp(255, 149, t)})`;
}

function AlgeriaMap({ byCity, periodLabel }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);

  const ids = Object.keys(ALGERIA_MAP.paths);
  const max = Math.max(...Object.values(byCity).map((v) => v.orders), 0);
  const total = Object.values(byCity).reduce((s, v) => s + v.orders, 0);

  const top = Object.entries(byCity)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 5);

  const onMove = (e, id) => {
    const rect = wrapRef.current.getBoundingClientRect();
    setHover({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const info = hover ? byCity[hover.id] : null;

  return (
    <div className="ov-card">
      <div className="ov-card__head">
        <div>
          <p className="ov-card__title">Orders by wilaya</p>
          <p className="ov-card__big"><span className="ov-num">{total}</span> orders</p>
        </div>
        <span className="ov-card__hint">{periodLabel}</span>
      </div>

      <div className="ov-map__wrap" ref={wrapRef}>
        <svg
          className="ov-map__svg"
          viewBox={ALGERIA_MAP.viewBox}
          role="img"
          aria-label="Map of Algeria"
          onPointerLeave={() => setHover(null)}
        >
          {ids.map((id) => (
            <path
              key={id}
              d={ALGERIA_MAP.paths[id]}
              fillRule="evenodd"
              className="ov-map__path"
              style={{ fill: shade(byCity[id]?.orders, max) }}
              onPointerMove={(e) => onMove(e, id)}
              onPointerDown={(e) => onMove(e, id)}
            />
          ))}
          {hover && <path d={ALGERIA_MAP.paths[hover.id]} fillRule="evenodd" className="ov-map__hl" />}
        </svg>

        {hover && (
          <div className="ov-map__tip" style={{ left: hover.x, top: hover.y }}>
            <b>{CITY_BY_ID[hover.id]}</b><br />
            <span><span className="ov-num">{info?.orders || 0}</span> orders</span>
            {info?.sales > 0 && <span> · <span className="ov-num">{fmt(info.sales)}</span> DA</span>}
          </div>
        )}
      </div>

      <div className="ov-map__legend">
        <span className="ov-num">0</span>
        <div className="ov-map__ramp" />
        <span className="ov-num">{max}</span>
      </div>

      {top.length === 0 ? (
        <p className="ov-top__empty">No orders in this period</p>
      ) : (
        <ul className="ov-top">
          {top.map(([id, v]) => (
            <li key={id} className="ov-top__row">
              <span className="ov-top__name">{CITY_BY_ID[id]}</span>
              <div className="ov-top__bar">
                <div className="ov-top__fill" style={{ width: `${(v.orders / max) * 100}%` }} />
              </div>
              <span className="ov-top__count ov-num">{v.orders}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────
function OverviewPage() {
  const navigate = useNavigate();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("7d");
  const [now,     setNow]     = useState(() => Date.now());
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (!document.getElementById("ov-styles-v2")) {
      const style = document.createElement("style");
      style.id = "ov-styles-v2";
      style.textContent = ovStyles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const t = getToken();
    if (!t) { navigate("/login"); return; }

    fetch(`${getAPI()}/api/stores/my-store`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => { if (d?.store?.name) setStoreName(d.store.name); })
      .catch(() => {});

    fetch(`${getAPI()}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) { setOrders(data); setNow(Date.now()); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const periodDef = PERIODS.find((p) => p.key === period);

  const view = useMemo(() => {
    const { buckets, from, to } = buildBuckets(periodDef, now);
    const span = to - from;

    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (t < from || t >= to) continue;
      const idx = Math.min(buckets.length - 1, Math.floor((t - from) / periodDef.step));
      buckets[idx].orders += 1;
      if (o.status === "delivered") buckets[idx].sales += o.totalPrice || 0;
    }

    const cur  = summarise(orders, from, to);
    const prev = summarise(orders, from - span, from);

    const byCity = {};
    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (t < from || t >= to || o.status === "cancelled") continue;
      const id = ID_BY_NAME[(o.shippingCity || "").trim()];
      if (!id) continue;
      if (!byCity[id]) byCity[id] = { orders: 0, sales: 0 };
      byCity[id].orders += 1;
      if (o.status === "delivered") byCity[id].sales += o.totalPrice || 0;
    }

    return { buckets, cur, prev, byCity };
  }, [orders, periodDef, now]);

  if (loading) {
    return (
      <div className="ov-loading">
        <div className="ov-loading__spinner" />
        <p>Loading data...</p>
      </div>
    );
  }

  const { buckets, cur, prev, byCity } = view;
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateText = new Date(now).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  const cancelRate = cur.orders > 0 ? Math.round((cur.cancelled / cur.orders) * 100) : 0;

  return (
    <div className="ov-page" dir="ltr">

      <div className="ov-head">
        <div>
          <h2 className="ov-head__title">{greeting}{storeName ? `, ${storeName}` : ""}</h2>
          <p className="ov-head__date">{dateText}</p>
        </div>
        <div className="ov-tabs" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={period === p.key}
              className={`ov-tab ${period === p.key ? "ov-tab--active" : ""}`}
              onClick={() => setPeriod(p.key)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      <div className="ov-stats">
        <StatCard
          label="Orders"
          value={cur.orders}
          delta={makeDelta(cur.orders, prev.orders)}
          note="vs previous period"
        />
        <StatCard
          label="Sales"
          value={fmt(cur.sales)}
          unit="DA"
          delta={makeDelta(cur.sales, prev.sales)}
          note="Delivered orders"
        />
        <StatCard
          label="Processing"
          value={cur.pending}
          delta={makeDelta(cur.pending, prev.pending)}
          note="Awaiting confirmation"
        />
        <StatCard
          label="Cancelled"
          value={cur.cancelled}
          delta={makeDelta(cur.cancelled, prev.cancelled, true)}
          note={cur.orders > 0 ? `${cancelRate}% of orders` : "No orders"}
        />
      </div>

      <div className="ov-main">
        <SalesTrend
          buckets={buckets}
          totalSales={cur.sales}
          deliveredCount={cur.delivered}
          periodLabel={periodDef.label}
        />
        <AlgeriaMap byCity={byCity} periodLabel={periodDef.label} />
      </div>

    </div>
  );
}

export default OverviewPage;
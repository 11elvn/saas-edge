// ============================================================
// 📁 pages/OverviewPage.jsx
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALGERIAN_CITIES } from "../constants/algerianCities";
import { ALGERIA_MAP } from "../constants/algeriaMap";
import { usePrefs } from "../context/PrefsContext";

const getToken = () => localStorage.getItem("token");
const getAPI   = () => import.meta.env.VITE_API_URL;

const HOUR = 3600 * 1000;
const DAY  = 24 * HOUR;

const MASK = "••••";

const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d; };
const addDays    = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// range(now) → الفترة الحالية، prev(now) → الفترة السابقة للمقارنة (اختياري)
const PERIODS = [
  {
    key: "today", label: "Today", step: HOUR,
    range: (now) => { const s = startOfDay(now); return { from: s.getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "yesterday", label: "Yesterday", step: HOUR,
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -1).getTime(), to: s.getTime() }; },
  },
  {
    key: "7d", label: "Last 7 days", step: DAY,
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -6).getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "30d", label: "Last 30 days", step: DAY,
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -29).getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "month", label: "This month", step: DAY,
    range: (now) => {
      const s = startOfDay(now);
      return { from: new Date(s.getFullYear(), s.getMonth(), 1).getTime(), to: addDays(s, 1).getTime() };
    },
    prev: (now) => {
      const s = startOfDay(now);
      const first = new Date(s.getFullYear(), s.getMonth() - 1, 1);
      return { from: first.getTime(), to: addDays(first, s.getDate()).getTime() };
    },
  },
  {
    key: "lastMonth", label: "Last month", step: DAY,
    range: (now) => {
      const s = startOfDay(now);
      return {
        from: new Date(s.getFullYear(), s.getMonth() - 1, 1).getTime(),
        to:   new Date(s.getFullYear(), s.getMonth(), 1).getTime(),
      };
    },
    prev: (now) => {
      const s = startOfDay(now);
      return {
        from: new Date(s.getFullYear(), s.getMonth() - 2, 1).getTime(),
        to:   new Date(s.getFullYear(), s.getMonth() - 1, 1).getTime(),
      };
    },
  },
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

.ov-page{
  display:flex;flex-direction:column;gap:20px;
  position:relative;border-radius:22px;padding:24px;
  border:1px solid rgba(255,255,255,.9);
  background:
    radial-gradient(520px 340px at 92% -6%, rgba(167,139,250,.55), transparent 70%),
    radial-gradient(460px 360px at -4% 105%, rgba(196,181,253,.5), transparent 70%),
    radial-gradient(380px 260px at 55% 48%, rgba(221,214,254,.45), transparent 70%),
    #faf7ff;
  box-shadow:0 10px 40px rgba(137,75,244,.10), inset 0 1px 0 rgba(255,255,255,.9);
}
.ov-num{direction:ltr;unicode-bidi:isolate;display:inline-block;}

.ov-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:relative;z-index:5;}
.ov-head__title{font-size:1.5rem;font-weight:700;color:#111827;line-height:1.2;}
.ov-head__date{font-size:.82rem;color:#6b7280;margin-top:4px;}
.ov-tabs{display:inline-flex;gap:2px;padding:3px;background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.9);border-radius:10px;}
.ov-tab{
  padding:7px 14px;border:none;border-radius:8px;background:transparent;
  color:#6b7280;font-size:.8rem;font-weight:500;cursor:pointer;
  font-family:inherit;transition:background .15s,color .15s;white-space:nowrap;
}
.ov-tab:hover{color:#111827;}
.ov-tab:focus-visible{outline:2px solid #894bf4;outline-offset:1px;}
.ov-tab--active,.ov-tab--active:hover{background:#894bf4;color:#fff;}

.ov-ctrls{display:flex;align-items:center;gap:10px;}
.ov-select{position:relative;}
.ov-select__btn{
  display:flex;align-items:center;gap:9px;height:42px;padding:0 14px;
  border:1px solid rgba(255,255,255,.9);border-radius:12px;background:#fff;
  box-shadow:0 2px 10px rgba(137,75,244,.10);
  font-family:inherit;font-size:.85rem;font-weight:600;color:#111827;cursor:pointer;
  transition:box-shadow .15s;
}
.ov-select__btn:hover{box-shadow:0 4px 16px rgba(137,75,244,.18);}
.ov-select__btn:focus-visible{outline:2px solid #894bf4;outline-offset:1px;}
.ov-select__btn svg{flex-shrink:0;color:#6b7280;}
.ov-select__chev{transition:transform .15s;}
.ov-select.is-open .ov-select__chev{transform:rotate(180deg);}
.ov-select__menu{
  position:absolute;top:calc(100% + 8px);right:0;min-width:190px;
  background:#fff;border:1px solid #ebe7f7;border-radius:14px;
  box-shadow:0 12px 36px rgba(15,23,42,.14);padding:6px;z-index:30;
  animation:ov-pop .14s ease;
}
.ov-select__item{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  width:100%;padding:10px 12px;border:none;border-radius:9px;background:none;
  font-family:inherit;font-size:.85rem;font-weight:500;color:#374151;
  cursor:pointer;text-align:start;transition:background .15s,color .15s;
}
.ov-select__item:hover{background:#f4f1fe;color:#5b3fd6;}
.ov-select__item--on,.ov-select__item--on:hover{background:#894bf4;color:#fff;}
@keyframes ov-pop{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}

.ov-eye{
  width:42px;height:42px;border-radius:50%;
  border:1px solid rgba(255,255,255,.9);background:rgba(255,255,255,.75);color:#6b7280;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:background .15s,color .15s;
}
.ov-eye:hover{background:#fff;color:#111827;}
.ov-eye:focus-visible{outline:2px solid #894bf4;outline-offset:1px;}
.ov-eye--on{background:#ede9ff;color:#894bf4;}

.ov-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
.ov-stat{
  background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.85);border-radius:16px;
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  box-shadow:0 4px 20px rgba(137,75,244,.07);
  padding:18px 20px;display:flex;flex-direction:column;gap:8px;min-width:0;
}
.ov-stat__label{font-size:.8rem;color:#6b7280;font-weight:500;}
.ov-stat__value{font-size:1.75rem;font-weight:700;color:#111827;line-height:1.1;white-space:nowrap;}
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
  background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.85);border-radius:16px;
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  box-shadow:0 4px 20px rgba(137,75,244,.07);
  padding:16px 18px;display:flex;flex-direction:column;min-width:0;
}
.ov-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;}
.ov-card__title{font-size:.82rem;font-weight:500;color:#6b7280;margin-bottom:4px;}
.ov-card__big{font-size:1.35rem;font-weight:700;color:#111827;line-height:1.1;}
.ov-card__hint{font-size:.74rem;color:#9ca3af;}

.ov-trend__plot{position:relative;flex:1;min-height:150px;display:flex;align-items:center;}
.ov-trend__svg{width:100%;height:auto;display:block;direction:ltr;touch-action:pan-y;}
.ov-trend__grid{stroke:rgba(137,75,244,.12);stroke-width:1;}
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
.ov-trend__sum-value{font-size:.95rem;font-weight:600;color:#111827;}

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
  .ov-page{padding:14px;border-radius:16px;}
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
  const { from, to } = period.range(nowMs);
  const pad = (n) => String(n).padStart(2, "0");

  const buckets = [];
  let cur = new Date(from);
  while (cur.getTime() < to) {
    const start = cur.getTime();
    const label = period.step === HOUR
      ? `${pad(cur.getHours())}:00`
      : `${cur.getDate()}/${cur.getMonth() + 1}`;
    buckets.push({ start, label, sales: 0, orders: 0, future: start > nowMs });
    cur = period.step === HOUR ? new Date(start + HOUR) : addDays(cur, 1);
  }
  return { buckets, from, to };
}

function bucketIndex(buckets, ts) {
  let idx = 0;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].start <= ts) idx = i; else break;
  }
  return idx;
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
function StatCard({ label, value, unit, delta, note, hidden }) {
  return (
    <div className="ov-stat">
      <span className="ov-stat__label">{label}</span>
      <span className="ov-stat__value">
        <span className="ov-num">{hidden ? MASK : value}</span>
        {unit && !hidden && <span className="ov-stat__unit">{unit}</span>}
      </span>
      <div className="ov-stat__foot">
        {delta && !hidden && (
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
function SalesTrend({ buckets, totalSales, deliveredCount, periodLabel, hidden }) {
  const W = 640, H = 190;
  const PL = 44, PR = 12, PT = 10, PB = 26;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;

  const [hover, setHover] = useState(null);

  const maxVal = Math.max(...buckets.map((b) => b.sales), 0);
  const { max: yMax, step } = niceScale(maxVal);
  const n = buckets.length;

  const pts = buckets.map((b, i) => ({
    x: PL + (i / Math.max(n - 1, 1)) * plotW,
    y: PT + plotH - (b.sales / yMax) * plotH,
  }));

  // الساعات/الأيام المستقبلية ما نرسموهاش (مثلا بقية اليوم)
  const live     = pts.filter((_, i) => !buckets[i].future);
  const lastLive = live.length - 1;
  const line = monotonePath(live);
  const area = `${line} L${live[lastLive].x},${PT + plotH} L${live[0].x},${PT + plotH} Z`;

  const labelEvery = Math.ceil(n / 6);
  const best = buckets.reduce((a, b) => (b.sales > a.sales ? b : a), buckets[0]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((x - PL) / plotW) * Math.max(n - 1, 1));
    setHover(Math.max(0, Math.min(lastLive, idx)));
  };

  const tipLeft = hover === null ? 0 : Math.max(14, Math.min(86, (pts[hover].x / W) * 100));

  return (
    <div className="ov-card">
      <div className="ov-card__head">
        <div>
          <p className="ov-card__title">Sales trend</p>
          <p className="ov-card__big"><span className="ov-num">{hidden ? MASK : fmt(totalSales)}</span> DA</p>
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
                  {hidden ? "" : compact(step * i)}
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
            <b><span className="ov-num" style={{ color: "#fff" }}>{hidden ? MASK : fmt(buckets[hover].sales)}</span> DA</b><br />
            <span><span className="ov-num">{hidden ? MASK : buckets[hover].orders}</span> orders</span>
          </div>
        )}
      </div>

      <div className="ov-trend__sum">
        <div>
          <p className="ov-trend__sum-label">Delivered orders</p>
          <p className="ov-trend__sum-value"><span className="ov-num">{hidden ? MASK : deliveredCount}</span></p>
        </div>
        <div>
          <p className="ov-trend__sum-label">Average order value</p>
          <p className="ov-trend__sum-value">
            <span className="ov-num">{deliveredCount > 0 ? (hidden ? MASK : fmt(totalSales / deliveredCount)) : "—"}</span>
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

function AlgeriaMap({ byCity, periodLabel, hidden }) {
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
          <p className="ov-card__big"><span className="ov-num">{hidden ? MASK : total}</span> orders</p>
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
            <span><span className="ov-num">{hidden ? MASK : (info?.orders || 0)}</span> orders</span>
            {info?.sales > 0 && <span> · <span className="ov-num">{hidden ? MASK : fmt(info.sales)}</span> DA</span>}
          </div>
        )}
      </div>

      <div className="ov-map__legend">
        <span className="ov-num">0</span>
        <div className="ov-map__ramp" />
        <span className="ov-num">{hidden ? MASK : max}</span>
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
              <span className="ov-top__count ov-num">{hidden ? MASK : v.orders}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Period dropdown ───────────────────────────────────────
function PeriodSelect({ value, onChange, options, ariaLabel, tr }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey  = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.key === value) || options[0];
  const ico = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };

  return (
    <div className={`ov-select${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="ov-select__btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <svg width="16" height="16" {...ico}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{tr(current.label)}</span>
        <svg className="ov-select__chev" width="13" height="13" {...ico} strokeWidth={2.5}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="ov-select__menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="option"
              aria-selected={o.key === value}
              className={`ov-select__item${o.key === value ? " ov-select__item--on" : ""}`}
              onClick={() => { onChange(o.key); setOpen(false); }}
            >
              <span>{tr(o.label)}</span>
              {o.key === value && (
                <svg width="15" height="15" {...ico} strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────
function OverviewPage() {
  const navigate = useNavigate();
  const { t: tr } = usePrefs();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("7d");
  const [now,     setNow]     = useState(() => Date.now());
  const [storeName, setStoreName] = useState("");

  // 👁 إخفاء الأرقام (محفوظ بعد تحديث الصفحة)
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem("ovHideNumbers") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("ovHideNumbers", hidden ? "1" : "0"); } catch { /* ignore */ }
  }, [hidden]);

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
    const prevR = periodDef.prev
      ? periodDef.prev(now)
      : { from: from - (to - from), to: from };

    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (t < from || t >= to) continue;
      const b = buckets[bucketIndex(buckets, t)];
      b.orders += 1;
      if (o.status === "delivered") b.sales += o.totalPrice || 0;
    }

    const cur  = summarise(orders, from, to);
    const prev = summarise(orders, prevR.from, prevR.to);

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
        <div className="ov-ctrls">
          <PeriodSelect
            value={period}
            onChange={setPeriod}
            options={PERIODS}
            ariaLabel={tr("Period")}
            tr={tr}
          />
          <button
            type="button"
            className={`ov-eye${hidden ? " ov-eye--on" : ""}`}
            onClick={() => setHidden((h) => !h)}
            aria-pressed={hidden}
            aria-label={hidden ? tr("Show numbers") : tr("Hide numbers")}
            title={hidden ? tr("Show numbers") : tr("Hide numbers")}
          >
            {hidden ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="ov-stats">
        <StatCard
          hidden={hidden}
          label="Orders"
          value={cur.orders}
          delta={makeDelta(cur.orders, prev.orders)}
          note="vs previous period"
        />
        <StatCard
          hidden={hidden}
          label="Sales"
          value={fmt(cur.sales)}
          unit="DA"
          delta={makeDelta(cur.sales, prev.sales)}
          note="Delivered orders"
        />
        <StatCard
          hidden={hidden}
          label="Processing"
          value={cur.pending}
          delta={makeDelta(cur.pending, prev.pending)}
          note="Awaiting confirmation"
        />
        <StatCard
          hidden={hidden}
          label="Cancelled"
          value={cur.cancelled}
          delta={makeDelta(cur.cancelled, prev.cancelled, true)}
          note={cur.orders > 0 ? (hidden ? "—" : `${cancelRate}% of orders`) : "No orders"}
        />
      </div>

      <div className="ov-main">
        <SalesTrend
          buckets={buckets}
          totalSales={cur.sales}
          deliveredCount={cur.delivered}
          periodLabel={tr(periodDef.label)}
          hidden={hidden}
        />
        <AlgeriaMap byCity={byCity} periodLabel={tr(periodDef.label)} hidden={hidden} />
      </div>

    </div>
  );
}

export default OverviewPage;
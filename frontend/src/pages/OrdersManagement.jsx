// ============================================================
// 📁 pages/OrdersManagement.jsx — Orders (Overview style)
// Date filter + status filters + search + light table rows + round action buttons
// + Create Order (manual order from the merchant dashboard)
// ============================================================
import { useState, useEffect, useRef } from "react";
import { usePrefs } from "../context/PrefsContext";
import { ALGERIAN_CITIES } from "../constants/algerianCities";

const API      = () => import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const ALGERIAN_PHONE_REGEX = /^0[5-7][0-9]{8}$/;

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

// ── Date periods (same options as Overview + "All time") ──────
const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d; };
const addDays    = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const PERIODS = [
  { key: "all", label: "All time", range: null },
  {
    key: "today", label: "Today",
    range: (now) => { const s = startOfDay(now); return { from: s.getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "yesterday", label: "Yesterday",
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -1).getTime(), to: s.getTime() }; },
  },
  {
    key: "7d", label: "Last 7 days",
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -6).getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "30d", label: "Last 30 days",
    range: (now) => { const s = startOfDay(now); return { from: addDays(s, -29).getTime(), to: addDays(s, 1).getTime() }; },
  },
  {
    key: "month", label: "This month",
    range: (now) => {
      const s = startOfDay(now);
      return { from: new Date(s.getFullYear(), s.getMonth(), 1).getTime(), to: addDays(s, 1).getTime() };
    },
  },
  {
    key: "lastMonth", label: "Last month",
    range: (now) => {
      const s = startOfDay(now);
      return {
        from: new Date(s.getFullYear(), s.getMonth() - 1, 1).getTime(),
        to:   new Date(s.getFullYear(), s.getMonth(), 1).getTime(),
      };
    },
  },
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

/* create order button (same look as "Edit theme") */
.od-btn-create{
  display:inline-flex;align-items:center;gap:8px;
  height:42px;padding:0 20px;border-radius:999px;border:none;
  background:#894bf4;color:#fff;
  font-size:.85rem;font-weight:600;
  cursor:pointer;font-family:inherit;transition:background .15s,box-shadow .15s;
  box-shadow:0 4px 14px rgba(137,75,244,.25);
}
.od-btn-create:hover{background:#7c3aed;box-shadow:0 6px 18px rgba(137,75,244,.32);}
.od-btn-create:focus-visible{outline:2px solid #894bf4;outline-offset:2px;}
.od-btn-create:disabled{opacity:.6;cursor:not-allowed;}

/* filter bar: date select + status chips */
.od-fbar{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;position:relative;z-index:5;}

/* date select (same look as Overview period select) */
.od-dsel{position:relative;}
.od-dsel__btn{
  display:flex;align-items:center;gap:9px;height:42px;padding:0 18px;
  border:1px solid rgba(255,255,255,.9);border-radius:999px;background:#fff;
  box-shadow:0 2px 10px rgba(137,75,244,.10);
  font-family:inherit;font-size:.85rem;font-weight:600;color:#111827;cursor:pointer;
  transition:box-shadow .15s;
}
.od-dsel__btn:hover{box-shadow:0 4px 16px rgba(137,75,244,.18);}
.od-dsel__btn:hover svg{color:#894bf4;}
.od-dsel__btn:focus-visible{outline:2px solid #894bf4;outline-offset:1px;}
.od-dsel__btn svg{flex-shrink:0;color:#6b7280;}
.od-dsel__chev{transition:transform .15s;}
.od-dsel.is-open .od-dsel__chev{transform:rotate(180deg);}
.od-dsel__menu{
  position:absolute;top:calc(100% + 8px);left:0;min-width:190px;
  background:#fff;border:1px solid #ebe7f7;border-radius:24px;
  box-shadow:0 12px 36px rgba(137,75,244,.14);padding:8px;z-index:30;
  animation:od-pop .14s ease;
}
.od-dsel__item{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  width:100%;padding:10px 16px;border:none;border-radius:999px;background:none;
  font-family:inherit;font-size:.85rem;font-weight:500;color:#374151;
  cursor:pointer;text-align:start;transition:background .15s,color .15s;
}
.od-dsel__item:hover{background:#f4f1fe;color:#894bf4;}
.od-dsel__item--on,.od-dsel__item--on:hover{background:#894bf4;color:#fff;}
@keyframes od-pop{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}

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

/* modals */
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
.od-modal--wide{width:min(560px,100%);}
.od-modal__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.od-modal__title{font-size:1.1rem;font-weight:700;margin:0;color:#111827;}
.od-dl{display:flex;flex-direction:column;}
.od-dl__row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;font-size:.85rem;}
.od-dl__row + .od-dl__row{border-top:1px solid #f1ecfd;}
.od-dl__k{color:#9ca3af;flex-shrink:0;}
.od-dl__v{color:#111827;font-weight:600;text-align:right;min-width:0;overflow-wrap:anywhere;}
.od-dl__v--ltr{direction:ltr;}

/* create order form */
.od-form{display:flex;flex-direction:column;gap:14px;}
.od-f2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.od-fld{display:flex;flex-direction:column;gap:6px;min-width:0;}
.od-lbl{font-size:.75rem;font-weight:600;color:#6b7280;}
.od-inp{
  height:42px;padding:0 14px;border:1px solid #ebe7f7;border-radius:999px;background:#fff;
  font-family:inherit;font-size:.85rem;color:#111827;outline:none;min-width:0;width:100%;box-sizing:border-box;
  transition:box-shadow .15s,border-color .15s;
}
.od-inp:focus{border-color:#894bf4;box-shadow:0 0 0 2px rgba(137,75,244,.25);}
.od-inp--area{height:auto;min-height:70px;padding:10px 14px;border-radius:18px;resize:vertical;}
.od-line{
  display:grid;grid-template-columns:1fr 70px 34px;gap:8px;align-items:center;
}
.od-line__opts{grid-column:1 / -1;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.od-line + .od-line{padding-top:10px;border-top:1px solid #f1ecfd;}
.od-add{
  align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;
  border:1px dashed #c4b5fd;border-radius:999px;background:#fff;color:#894bf4;
  font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;
}
.od-add:hover{background:#f4f1fe;}
.od-sum{
  display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:16px;
  background:#f4f1fe;font-size:.82rem;color:#374151;
}
.od-sum__row{display:flex;justify-content:space-between;gap:12px;}
.od-sum__row--tot{font-weight:700;color:#111827;font-size:.9rem;}
.od-err{font-size:.78rem;color:#ef4444;margin:0;}
.od-factions{display:flex;gap:8px;justify-content:flex-end;}
.od-btn-ghost{
  height:42px;padding:0 20px;border-radius:999px;border:1px solid #ebe7f7;background:#fff;color:#374151;
  font-family:inherit;font-size:.85rem;font-weight:600;cursor:pointer;
}
.od-btn-ghost:hover{background:#f4f1fe;color:#894bf4;}

.od-foot{border-top:1px solid #f1ecfd;padding:12px 20px;font-size:.75rem;color:#9ca3af;}
.od-foot strong{color:#374151;}
.od-empty{padding:48px 20px;text-align:center;color:#9ca3af;font-size:.9rem;}

@media (max-width:768px){
  .od-page{padding:14px;border-radius:16px;}
  .od-f2{grid-template-columns:1fr;}
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
const IconPlus  = () => (<svg width="16" height="16" {...ico} strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);

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

// ── Date dropdown ──────────────────────────────────────────────
function DateSelect({ value, onChange, options, ariaLabel, t }) {
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

  return (
    <div className={`od-dsel${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="od-dsel__btn"
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
        <span>{t(current.label)}</span>
        <svg className="od-dsel__chev" width="13" height="13" {...ico} strokeWidth={2.5}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="od-dsel__menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="option"
              aria-selected={o.key === value}
              className={`od-dsel__item${o.key === value ? " od-dsel__item--on" : ""}`}
              onClick={() => { onChange(o.key); setOpen(false); }}
            >
              <span>{t(o.label)}</span>
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

// ── Create Order modal ─────────────────────────────────────────
const emptyLine = () => ({ productId: "", quantity: 1, color: "", size: "" });

function CreateOrderModal({ t, onClose, onCreated }) {
  const [products,   setProducts]   = useState([]);
  const [loadingP,   setLoadingP]   = useState(true);
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [city,       setCity]       = useState("");
  const [commune,    setCommune]    = useState("");
  const [address,    setAddress]    = useState("");
  const [note,       setNote]       = useState("");
  const [lines,      setLines]      = useState([emptyLine()]);
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API()}/api/products/my-products`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (alive && res.ok && Array.isArray(data)) setProducts(data);
      } catch { /* ignore */ }
      finally { if (alive) setLoadingP(false); }
    })();
    return () => { alive = false; };
  }, []);

  const productById = (id) => products.find(p => p._id === id);

  const setLine = (idx, patch) =>
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const addLine    = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const cityObj  = ALGERIAN_CITIES.find(c => c.name === city);
  const shipping = cityObj ? cityObj.price : 0;
  const itemsTotal = lines.reduce((sum, l) => {
    const p = productById(l.productId);
    return sum + (p ? (p.currentPrice || 0) * Math.max(1, Number(l.quantity) || 1) : 0);
  }, 0);
  const total = itemsTotal + (cityObj ? shipping : 0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.trim().replace(/\s/g, "");
    if (!name.trim())                          return setError(t("Enter the customer name"));
    if (!ALGERIAN_PHONE_REGEX.test(cleanPhone)) return setError(t("Enter a valid Algerian phone number (e.g. 0550123456)"));
    if (!city)                                 return setError(t("Choose a wilaya"));

    const picked = lines.filter(l => l.productId);
    if (picked.length === 0)                   return setError(t("Add at least one product"));

    for (const l of picked) {
      const p = productById(l.productId);
      if (!p) return setError(t("Add at least one product"));
      if (p.colors?.length > 0 && !l.color) return setError(`${t("Choose a color for")} ${p.name}`);
      if (p.sizes?.length  > 0 && !l.size)  return setError(`${t("Choose a size for")} ${p.name}`);
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API()}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          customerName: name.trim(),
          phone:        cleanPhone,
          shippingCity: city,
          municipality: commune.trim(),
          address:      address.trim(),
          note:         note.trim(),
          items: picked.map(l => ({
            productId: l.productId,
            quantity:  Math.max(1, Number(l.quantity) || 1),
            color:     l.color || null,
            size:      l.size  || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || t("Something went wrong ❌")); return; }
      onCreated();
    } catch {
      setError(t("Connection error ❌"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="od-ov" onClick={onClose}>
      <form
        className="od-modal od-modal--wide"
        role="dialog" aria-modal="true" aria-label={t("Create Order")}
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        noValidate
      >
        <div className="od-modal__head">
          <h2 className="od-modal__title">{t("Create Order")}</h2>
          <button type="button" className="od-circ" style={{ width: 36, height: 36 }} onClick={onClose} title={t("Close")} aria-label={t("Close")}>
            <IconX />
          </button>
        </div>

        <div className="od-form">
          <div className="od-f2">
            <label className="od-fld">
              <span className="od-lbl">{t("Customer")}</span>
              <input className="od-inp" value={name} onChange={e => setName(e.target.value)} placeholder={t("Customer")} />
            </label>
            <label className="od-fld">
              <span className="od-lbl">{t("Phone")}</span>
              <input className="od-inp" dir="ltr" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0550123456" />
            </label>
          </div>

          <div className="od-f2">
            <label className="od-fld">
              <span className="od-lbl">{t("Wilaya")}</span>
              <select className="od-inp" value={city} onChange={e => setCity(e.target.value)}>
                <option value="">{t("Choose a wilaya")}</option>
                {ALGERIAN_CITIES.map(c => (
                  <option key={c.id} value={c.name}>{c.id} - {c.name}</option>
                ))}
              </select>
            </label>
            <label className="od-fld">
              <span className="od-lbl">{t("Commune")}</span>
              <input className="od-inp" value={commune} onChange={e => setCommune(e.target.value)} />
            </label>
          </div>

          <label className="od-fld">
            <span className="od-lbl">{t("Address")}</span>
            <input className="od-inp" value={address} onChange={e => setAddress(e.target.value)} />
          </label>

          <div className="od-fld">
            <span className="od-lbl">{t("Product")}</span>
            {loadingP ? (
              <span style={{ fontSize: ".8rem", color: "#9ca3af" }}>{t("Loading orders...")}</span>
            ) : products.length === 0 ? (
              <span style={{ fontSize: ".8rem", color: "#9ca3af" }}>{t("No products found")}</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lines.map((l, idx) => {
                  const p = productById(l.productId);
                  return (
                    <div className="od-line" key={idx}>
                      <select
                        className="od-inp"
                        value={l.productId}
                        onChange={e => setLine(idx, { productId: e.target.value, color: "", size: "" })}
                      >
                        <option value="">{t("Choose a product")}</option>
                        {products.map(pr => (
                          <option key={pr._id} value={pr._id} disabled={(pr.stock ?? 0) <= 0}>
                            {pr.name} — {(pr.currentPrice || 0).toLocaleString("en-US")} DA{(pr.stock ?? 0) <= 0 ? ` (${t("Out of stock")})` : ""}
                          </option>
                        ))}
                      </select>
                      <input
                        className="od-inp" type="number" min="1" max={p?.stock || undefined}
                        value={l.quantity}
                        onChange={e => setLine(idx, { quantity: e.target.value })}
                        aria-label={t("Quantity")}
                      />
                      <button
                        type="button" className="od-ib od-ib--no"
                        onClick={() => removeLine(idx)}
                        disabled={lines.length === 1}
                        title={t("Remove")} aria-label={t("Remove")}
                      >
                        <IconX />
                      </button>

                      {p && (p.colors?.length > 0 || p.sizes?.length > 0) && (
                        <div className="od-line__opts">
                          {p.colors?.length > 0 && (
                            <select className="od-inp" value={l.color} onChange={e => setLine(idx, { color: e.target.value })}>
                              <option value="">{t("Color")}</option>
                              {p.colors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                          )}
                          {p.sizes?.length > 0 && (
                            <select className="od-inp" value={l.size} onChange={e => setLine(idx, { size: e.target.value })}>
                              <option value="">{t("Size")}</option>
                              {p.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" className="od-add" onClick={addLine}>
                  <IconPlus /> {t("Add product")}
                </button>
              </div>
            )}
          </div>

          <label className="od-fld">
            <span className="od-lbl">{t("Note")}</span>
            <textarea className="od-inp od-inp--area" value={note} onChange={e => setNote(e.target.value)} />
          </label>

          <div className="od-sum">
            <div className="od-sum__row"><span>{t("Products")}</span><span>{itemsTotal.toLocaleString("en-US")} DA</span></div>
            <div className="od-sum__row"><span>{t("Shipping")}</span><span>{cityObj ? `${shipping.toLocaleString("en-US")} DA` : "—"}</span></div>
            <div className="od-sum__row od-sum__row--tot"><span>{t("Total")}</span><span>{total.toLocaleString("en-US")} DA</span></div>
          </div>

          {error && <p className="od-err" role="alert">{error}</p>}

          <div className="od-factions">
            <button type="button" className="od-btn-ghost" onClick={onClose}>{t("Cancel")}</button>
            <button type="submit" className="od-btn-create" disabled={submitting}>
              {submitting ? t("Creating...") : t("Create Order")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const OrdersManagement = () => {
  const { t } = usePrefs();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [notif,   setNotif]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [period,  setPeriod]  = useState("all");
  const [query,   setQuery]   = useState("");
  const [detail,  setDetail]  = useState(null);   // الطلب المعروض في نافذة التفاصيل
  const [creating, setCreating] = useState(false); // نافذة إنشاء طلب

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

  // Escape يسكر النوافذ
  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  useEffect(() => {
    if (!creating) return;
    const onKey = (e) => { if (e.key === "Escape") setCreating(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creating]);

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

  // فلترة التاريخ
  const periodDef = PERIODS.find(p => p.key === period) || PERIODS[0];
  const dated = periodDef.range
    ? (() => {
        const { from, to } = periodDef.range(Date.now());
        return orders.filter(o => {
          const ts = new Date(o.createdAt).getTime();
          return ts >= from && ts < to;
        });
      })()
    : orders;

  // عدّادات الفلاتر (حسب الفترة المختارة)
  const counts = {
    all:       dated.length,
    pending:   dated.filter(o => o.status === "pending").length,
    shipped:   dated.filter(o => o.status === "shipped").length,
    delivered: dated.filter(o => o.status === "delivered").length,
    cancelled: dated.filter(o => o.status === "cancelled").length,
  };

  // فلترة + بحث
  const q = query.trim().toLowerCase();
  const visible = dated.filter(o => {
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
          <button className="od-btn-create" onClick={() => setCreating(true)}>
            <IconPlus />
            {t("Create Order")}
          </button>
        </div>
      </div>

      {/* ══ DATE FILTER + STATUS CHIPS ══ */}
      <div className="od-fbar">
        <DateSelect
          value={period}
          onChange={setPeriod}
          options={PERIODS}
          ariaLabel={t("Filter by date")}
          t={t}
        />
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
          {t("Showing")} <strong>{visible.length}</strong> {t("of")} <strong>{dated.length}</strong> {t("orders")}
        </div>
      </div>

      {/* ══ CREATE ORDER MODAL ══ */}
      {creating && (
        <CreateOrderModal
          t={t}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            notify("Order created ✅");
            fetchOrders();
          }}
        />
      )}

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
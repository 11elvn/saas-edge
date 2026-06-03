// ============================================================
// 📁 ImageUploader.jsx — مكون رفع الصور المشترك
// يستخدم في: Theme (logo, banner) + Dashboard (product image)
// ============================================================

const CLOUDINARY_CLOUD  = "dbcbkly4w";
const CLOUDINARY_PRESET = "saas_edge";
const MAX_SIZE_MB        = 5;

/**
 * @param {object}   props
 * @param {string}   props.value        — الـ URL الحالي
 * @param {function} props.onChange     — callback(url: string)
 * @param {string}   props.label        — نص الزر (مثال: "رفع اللوجو")
 * @param {string}   props.aspect       — "square" | "wide" | "free"
 * @param {boolean}  props.dark         — ثيم داكن (افتراضي: true)
 */
function ImageUploader({ value, onChange, label = "رفع صورة", aspect = "free", dark = true }) {
  const [uploading, setUploading] = React.useState(false);
  const [error,     setError]     = React.useState("");

  const previewHeight = aspect === "square" ? "h-24 w-24" : aspect === "wide" ? "h-28 w-full" : "h-24 w-full";

  const handleFile = async (file) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("الملف ليس صورة ❌");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`الحجم يتجاوز ${MAX_SIZE_MB}MB ❌`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file",           file);
      formData.append("upload_preset",  CLOUDINARY_PRESET);

      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("فشل الرفع");
      const data = await res.json();
      onChange(data.secure_url);
    } catch {
      setError("فشل رفع الصورة، حاول مجدداً ❌");
    } finally {
      setUploading(false);
    }
  };

  const inputId = `img-upload-${label.replace(/\s/g, "-")}`;

  const base = dark
    ? "border border-white/10 rounded-xl overflow-hidden"
    : "border border-stone-200 rounded-xl overflow-hidden";

  return (
    <div className={base}>
      {/* معاينة الصورة */}
      {value && (
        <div className={`relative ${aspect === "square" ? "flex justify-center p-3" : ""}`}>
          <img
            src={value}
            alt="معاينة"
            className={`${previewHeight} object-cover ${aspect === "square" ? "rounded-lg" : "w-full"}`}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {/* زر حذف */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* زر الرفع */}
      <label
        htmlFor={inputId}
        className={`flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-colors text-sm font-medium
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          ${dark
            ? "bg-white/3 text-white/50 hover:bg-white/8 hover:text-white/80"
            : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          }`}
      >
        {uploading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            <span>جاري الرفع...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{value ? `تغيير ${label}` : `📤 ${label}`}</span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>

      {/* رسالة خطأ */}
      {error && (
        <p className="text-xs text-red-400 text-center py-1.5 px-3 bg-red-500/10">
          {error}
        </p>
      )}
    </div>
  );
}

// نضيفوا React كـ import لأن المكون يستخدم React.useState
import React from "react";
export default ImageUploader;
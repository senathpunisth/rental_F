// src/components/EditProfileSlideOver.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, UploadCloud, Trash2, Image as ImageIcon } from "lucide-react";

const SL_DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla",
  "Monaragala","Ratnapura","Kegalle",
];

const DOC_TYPES = ["NIC", "Driving License", "Passport", "Other"];
const ACCEPTED_MIME = [
  "image/jpeg","image/png","image/webp","application/pdf"
];
const MAX_FILE_MB = 10;

function bytesToMB(n) {
  return Math.round((n / (1024 * 1024)) * 10) / 10;
}

export default function EditProfileSlideOver({
  open,
  onClose,
  initialValues,
  onSubmit,
  onRemoveExistingDocument,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [docs, setDocs] = useState([]); // [{file, type}]
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(initialValues?.name || "");
      setEmail(initialValues?.email || "");
      setPhone(initialValues?.phone || "");
      setDistrict(initialValues?.district || "");
      setAvatar(null);
      setAvatarPreview(initialValues?.avatarUrl || "");
      setDocs([]);
      setErrors({});
      setSubmitting(false);

      // focus & prevent background scroll
      const t = setTimeout(() => nameRef.current?.focus(), 50);
      document.documentElement.style.overflow = "hidden";

      // Close on Esc
      const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKey);

      return () => {
        clearTimeout(t);
        document.documentElement.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open, initialValues, onClose]);

  // simple focus trap
  useEffect(() => {
    if (!open) return;
    const trap = (e) => {
      if (!panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", trap);
    return () => window.removeEventListener("keydown", trap);
  }, [open]);

  // drag & drop
  const [dragOver, setDragOver] = useState(false);
  const onDropFiles = (files) => {
    const arr = Array.from(files || []);
    const valid = [];
    const newErr = {};

    arr.forEach((file) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        newErr.docs = "Only JPG, PNG, WEBP, or PDF files are allowed.";
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        newErr.docs = `Each file must be ≤ ${MAX_FILE_MB} MB.`;
        return;
      }
      valid.push({ file, type: "Other" });
    });

    setDocs((d) => [...d, ...valid]);
    setErrors((e) => ({ ...e, ...newErr }));
  };

  // avatar preview
  const readAvatar = (file) => {
    if (!file) return setAvatarPreview(initialValues?.avatarUrl || "");
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg","image/png","image/webp"].includes(f.type)) {
      setErrors((er) => ({ ...er, avatar: "Avatar must be JPG, PNG, or WEBP." }));
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, avatar: `Avatar must be ≤ ${MAX_FILE_MB} MB.` }));
      return;
    }
    setAvatar(f);
    setErrors((er) => ({ ...er, avatar: undefined }));
    readAvatar(f);
  };
  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(initialValues?.avatarUrl || "");
  };

  const handleAddDocsInput = (e) => onDropFiles(e.target.files);
  const handleRemoveDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));
  const handleDocTypeChange = (idx, val) =>
    setDocs((d) => d.map((it, i) => (i === idx ? { ...it, type: val } : it)));

  const validate = () => {
    const er = {};
    if (!name.trim()) er.name = "Name is required.";
    if (!email.trim()) er.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) er.email = "Enter a valid email.";
    if (!phone.trim()) er.phone = "Phone is required.";
    if (!district.trim()) er.district = "District is required.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      fd.append("district", district);
      if (avatar) fd.append("avatar", avatar);
      docs.forEach((d, i) => {
        fd.append(`docs[${i}][file]`, d.file);
        fd.append(`docs[${i}][type]`, d.type || "Other");
      });

      await onSubmit?.(fd); // parent awaits & updates user state
      onClose?.();          // <-- CLOSES the panel on success
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop (click to close) */}
          <div className="flex-1 bg-black/40" onClick={onClose} />

          {/* Sheet */}
          <motion.div
            ref={panelRef}
            className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile and documents"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b bg-white/90 backdrop-blur">
              <div className="font-semibold text-slate-900">Edit Profile & Documents</div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">Basic Info</h3>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600">Full Name</label>
                      <input
                        ref={nameRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl border outline-none ${
                          errors.name ? "border-red-400" : "border-slate-300 focus:border-blue-400"
                        }`}
                        placeholder="e.g. Kavindu Perera"
                      />
                      {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl border outline-none ${
                          errors.email ? "border-red-400" : "border-slate-300 focus:border-blue-400"
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl border outline-none ${
                          errors.phone ? "border-red-400" : "border-slate-300 focus:border-blue-400"
                        }`}
                        placeholder="+94 7X XXX XXXX"
                      />
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl border outline-none appearance-none ${
                          errors.district ? "border-red-400" : "border-slate-300 focus:border-blue-400"
                        }`}
                      >
                        <option value="">Select district</option>
                        {SL_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.district && <p className="text-xs text-red-600 mt-1">{errors.district}</p>}
                    </div>
                  </div>
                </section>

                {/* Avatar */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">Avatar</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="inline-block">
                        <span className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 cursor-pointer">
                          Choose Image
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs text-slate-600 underline underline-offset-2 hover:text-slate-800 text-left"
                        >
                          Remove avatar
                        </button>
                      )}
                      <p className="text-xs text-slate-500">JPG, PNG, or WEBP • up to {MAX_FILE_MB}MB</p>
                      {errors.avatar && <p className="text-xs text-red-600">{errors.avatar}</p>}
                    </div>
                  </div>
                </section>

                {/* Documents */}
                <section>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                    <small className="text-slate-500">NIC / License / Passport (JPG, PNG, WEBP, PDF)</small>
                  </div>

                  {/* Drop zone */}
                  <div
                    className={`mt-3 rounded-xl border-2 border-dashed p-4 text-center transition
                      ${dragOver ? "border-blue-400 bg-blue-50/40" : "border-slate-300 bg-slate-50"}
                    `}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      onDropFiles(e.dataTransfer.files);
                    }}
                  >
                    <UploadCloud className="w-5 h-5 text-slate-500 mx-auto" />
                    <div className="mt-1 text-sm text-slate-700">Drag & drop files here</div>
                    <div className="text-xs text-slate-500">or</div>
                    <label className="inline-block mt-2">
                      <span className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 cursor-pointer">
                        Browse files
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        className="hidden"
                        multiple
                        onChange={handleAddDocsInput}
                      />
                    </label>
                    <div className="text-xs text-slate-500 mt-1">Max {MAX_FILE_MB}MB each</div>
                    {errors.docs && <p className="text-xs text-red-600 mt-1">{errors.docs}</p>}
                  </div>

                  {/* New docs list */}
                  {docs.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {docs.map((d, i) => (
                        <li key={`${d.file.name}-${i}`} className="flex items-center gap-3 rounded-lg border p-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{d.file.name}</div>
                            <div className="text-xs text-slate-500">
                              {d.file.type || "Unknown"} • {bytesToMB(d.file.size)}MB
                            </div>
                          </div>
                          <select
                            value={d.type}
                            onChange={(e) => handleDocTypeChange(i, e.target.value)}
                            className="px-2 py-1 rounded-md border border-slate-300 text-xs"
                            title="Document type"
                          >
                            {DOC_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(i)}
                            className="p-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Existing docs from server */}
                  {Array.isArray(initialValues?.documents) && initialValues.documents.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Existing</div>
                      <ul className="space-y-2">
                        {initialValues.documents.map((d) => (
                          <li key={d.id} className="flex items-center justify-between rounded-lg border p-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">{d.name}</div>
                              <div className="text-xs text-slate-500">{d.type || "Document"}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveExistingDocument?.(d.id)}
                              className="px-2 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              title="Remove existing document"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              </div>

              {/* Sticky actions */}
              <div className="border-t bg-white/95 backdrop-blur px-4 py-3">
                <button
                  disabled={submitting}
                  className="w-full rounded-xl bg-orange-500 text-white py-2 font-medium hover:bg-orange-600 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import EditProfileSlideOver from "../components/EditProfileSlideOver";
import DocumentPreviewModal from "../components/DocumentPreviewModal";

export default function UserPage() {
  const location = useLocation();

  // ---- Utils ----
  const isRealFile = (v) =>
    typeof File !== "undefined" && v instanceof File && v.size > 0;
  const makeDocId = (name, i) =>
    `new-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");
  const isPhone = (s) => /^\+?\d[\d\s-]{7,}$/.test(s || "");

  // ---- Mock user data (persisted to localStorage for demo) ----
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user-profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      name: "John Doe",
      email: "john.doe@gmail.com",
      phone: "+94 77 123 4567",
      district: "Colombo",
      avatarUrl: "",
      joinDate: "2025-02-14",
      documents: [
        { id: "d1", type: "NIC", name: "nic_front.jpg", status: "Verified", url: "" },
        { id: "d2", type: "NIC", name: "nic_back.jpg", status: "Verified", url: "" },
      ],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("user-profile", JSON.stringify(user));
    } catch {}
  }, [user]);

  // ---- Slide-over (profile/documents) ----
  const [open, setOpen] = useState(false);

  // ---- Document preview modal ----
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [tempUrls, setTempUrls] = useState([]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    if (previewDoc?._tmpObjectUrl) {
      URL.revokeObjectURL(previewDoc._tmpObjectUrl);
      setTempUrls((prev) => prev.filter((u) => u !== previewDoc._tmpObjectUrl));
    }
    setPreviewDoc(null);
  }, [previewDoc]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e) => e.key === "Escape" && closePreview();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen, closePreview]);

  useEffect(() => {
    return () => {
      tempUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [tempUrls]);

  const openPreview = (doc) => {
    setPreviewDoc(doc);
    setPreviewOpen(true);
  };

  // ---- Handle slide-over submit (profile + docs) ----
  const handleSubmit = async (formData) => {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const district = formData.get("district");

    if (!name) return alert("Name is required");
    if (!isEmail(email)) return alert("Enter a valid email");
    if (!isPhone(phone)) return alert("Enter a valid phone number");

    // Avatar preview
    const avatarFile = formData.get("avatar");
    let nextAvatarUrl = user.avatarUrl;
    if (isRealFile(avatarFile)) {
      const avatarPreview = URL.createObjectURL(avatarFile);
      setTempUrls((prev) => [...prev, avatarPreview]);
      nextAvatarUrl = avatarPreview;
    }

    // Docs previews
    const newDocs = [];
    const newTemps = [];
    for (let i = 0; ; i++) {
      const file = formData.get(`docs[${i}][file]`);
      const type = formData.get(`docs[${i}][type]`);
      if (!isRealFile(file)) break;

      const previewUrl = URL.createObjectURL(file);
      newTemps.push(previewUrl);
      newDocs.push({
        id: makeDocId(file.name, i),
        type,
        name: file.name,
        status: "Pending",
        url: previewUrl,
        _tmpObjectUrl: previewUrl,
      });
    }
    setTempUrls((prev) => [...prev, ...newTemps]);

    setUser((prev) => ({
      ...prev,
      name,
      email,
      phone,
      district,
      avatarUrl: nextAvatarUrl,
      documents: [...prev.documents, ...newDocs],
    }));
  };

  // Remove document
  const handleRemoveExistingDocument = async (docId) => {
    setUser((prev) => {
      const doc = prev.documents.find((d) => d.id === docId);
      if (doc?._tmpObjectUrl) {
        URL.revokeObjectURL(doc._tmpObjectUrl);
        setTempUrls((prevUrls) => prevUrls.filter((u) => u !== doc._tmpObjectUrl));
      }
      return { ...prev, documents: prev.documents.filter((d) => d.id !== docId) };
    });
  };

  // Prefill values for slide-over
  const initialValues = useMemo(
    () => ({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      district: user.district || "",
      avatarUrl: user.avatarUrl || "",
      documents: user.documents || [],
    }),
    [user]
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">My Account</h1>
          <p className="text-slate-600">
            Manage your profile and identity documents
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700"
          aria-haspopup="dialog"
          aria-expanded={open}
          type="button"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile info */}
      <section className="bg-white shadow-md rounded-2xl p-6 mt-6 border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No photo
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <p>
              <span className="font-semibold">Name:</span> {user.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {user.phone}
            </p>
            <p>
              <span className="font-semibold">District:</span> {user.district}
            </p>
            <p>
              <span className="font-semibold">Joined:</span> {user.joinDate}
            </p>
          </div>
        </div>

        {/* Documents list */}
        <div className="mt-6">
          <h3 className="font-medium">Identity Documents</h3>
          {user.documents?.length ? (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {user.documents.map((d) => {
                const ext = (d.name.split(".").pop() || "").toLowerCase();
                const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
                const isPDF = ext === "pdf";

                return (
                  <div
                    key={d.id}
                    className="relative p-2 rounded-lg border border-slate-200 bg-slate-50 hover:shadow-md transition group cursor-pointer"
                    title={d.name}
                    onClick={() => openPreview(d)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && openPreview(d)
                    }
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-square max-w-20 mx-auto rounded-md overflow-hidden flex items-center justify-center bg-white border border-slate-200">
                      {isImage && d.url ? (
                        <img
                          src={d.url}
                          alt={d.name}
                          className="w-full h-full object-cover"
                        />
                      ) : isPDF ? (
                        <div className="w-12 h-12 flex items-center justify-center rounded bg-red-100 text-red-700 text-xs font-semibold">
                          PDF
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                          FILE
                        </div>
                      )}
                    </div>

                    {/* Filename */}
                    <p className="mt-2 text-[11px] text-center truncate">{d.name}</p>

                    {/* Status */}
                    <span
                      className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full ${
                        d.status === "Verified"
                          ? "bg-green-100 text-green-700"
                          : d.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {d.status || "Pending"}
                    </span>

                    {/* Remove Button */}
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExistingDocument(d.id);
                      }}
                      aria-label={`Remove ${d.name}`}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-2" aria-live="polite">
              No documents uploaded yet.
            </p>
          )}
          <button
            onClick={() => setOpen(true)}
            className="mt-3 text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            aria-label="Upload / Update Documents"
            type="button"
          >
            Upload / Update Documents
          </button>
        </div>
      </section>

      {/* Slide-over & Preview Modal */}
      <EditProfileSlideOver
        open={open}
        onClose={() => setOpen(false)}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onRemoveExistingDocument={handleRemoveExistingDocument}
      />
      <DocumentPreviewModal
        open={previewOpen}
        onClose={closePreview}
        doc={previewDoc}
      />
    </main>
  );
}

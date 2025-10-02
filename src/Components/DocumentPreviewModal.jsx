import React from "react";

export default function DocumentPreviewModal({ open, onClose, doc }) {
  if (!open) return null;
  const name = doc?.name || "";
  const ext = (name.split(".").pop() || "").toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
  const isPDF = ext === "pdf";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="font-medium">{name || "Preview"}</div>
          <div className="flex items-center gap-2">
            {doc?.url && (
              <a
                href={doc.url}
                download
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Download
              </a>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 min-h-[50vh] flex items-center justify-center">
          {isImage && doc?.url ? (
            <img src={doc.url} alt={name} className="max-h-[70vh] object-contain" />
          ) : isPDF && doc?.url ? (
            <iframe title="pdf" src={doc.url} className="w-full h-[70vh] rounded-lg border" />
          ) : (
            <div className="text-slate-600">No preview available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  getAllReviews,
  approveReview,
  rejectReview,
  replyToReview,
  removeReview,
  subscribeReviews,
} from "../../utils/reviews";
import { Check, X, Reply, Trash2, Filter } from "lucide-react";

export default function AdminReviews() {
  const [status, setStatus] = useState("pending"); // pending | approved | rejected | all
  const [carId, setCarId] = useState(""); // empty = all cars
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeReviews(() => setTick((t) => t + 1)), []);

  const all = useMemo(() => {
    const s = status === "all" ? undefined : status;
    return getAllReviews({ status: s });
  }, [status, tick]);

  // build carId filter list
  const carIds = useMemo(() => Array.from(new Set(getAllReviews().map(r => r.carId))), [tick]);

  const filtered = useMemo(() => {
    let list = all;
    if (carId) list = list.filter((r) => r.carId === carId);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(s) ||
          (r.comment || "").toLowerCase().includes(s) ||
          (r.carId || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [all, carId, q]);

  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");

  const sendReply = (id) => {
    if (!replyText.trim()) return;
    replyToReview(id, { text: replyText.trim(), by: "Admin" });
    setReplyFor(null);
    setReplyText("");
  };

  return (
    <main className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500">Approve, reject, and reply to customer reviews per vehicle.</p>
      </header>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>

        <select
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="">All vehicles</option>
          {carIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, comment, carId"
          className="ml-auto px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm w-64"
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filtered.map((r) => (
          <article key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">Car: <span className="font-medium">{r.carId}</span></div>
                <div className="font-semibold text-gray-900">{r.name} <span className="text-yellow-500 ml-2">{"★".repeat(r.rating)}</span></div>
                <p className="text-gray-700 mt-1">{r.comment}</p>
                <div className="text-xs text-gray-500 mt-1">Date: {r.date} {r.bookingId ? `• Booking ${r.bookingId}` : ""}</div>

                {r.reply && (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                    <div className="font-medium text-blue-800">Reply from {r.reply.by} • {r.reply.date}</div>
                    <div className="text-blue-900 mt-1">{r.reply.text}</div>
                  </div>
                )}

                {replyFor === r.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply…"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => sendReply(r.id)}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" /> Send
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {r.status !== "approved" && (
                  <button
                    onClick={() => approveReview(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => rejectReview(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                )}
                <button
                  onClick={() => setReplyFor((v) => (v === r.id ? null : r.id))}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1"
                >
                  <Reply className="w-4 h-4" /> {replyFor === r.id ? "Cancel" : "Reply"}
                </button>
                <button
                  onClick={() => removeReview(r.id)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-gray-700"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-10">No reviews match the filter.</div>
        )}
      </div>
    </main>
  );
}

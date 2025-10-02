// src/pages/MyBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addReview, hasReviewed } from "../utils/reviews";

const STATUS_COLORS = {
  Confirmed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Completed: "bg-slate-200 text-slate-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const LKR = (n) => "Rs " + Number(n || 0).toLocaleString("en-LK");

export default function MyBookings() {
  const navigate = useNavigate();

  // Replace with real fetch from your API; ensure carId is included
  const [bookings, setBookings] = useState([
    {
      id: "BK-10241",
      carId: "axio-2017",
      carName: "Toyota Axio 2017",
      pickupDistrict: "Colombo",
      returnDistrict: "Colombo",
      pickupDate: "2025-09-05",
      returnDate: "2025-09-10",
      plan: "weekly",
      driver: "without",
      days: 6,
      subtotal: 90000,
      vat: 13500,
      total: 103500,
      status: "Confirmed",
    },
    {
      id: "BK-10212",
      carId: "vezel-2018",
      carName: "Honda Vezel",
      pickupDistrict: "Kandy",
      returnDistrict: "Kandy",
      pickupDate: "2025-08-10",
      returnDate: "2025-08-12",
      plan: "daily",
      driver: "with",
      days: 2,
      subtotal: 48000,
      vat: 7200,
      total: 55200,
      status: "Completed",
    },
    {
      id: "BK-10188",
      carId: "leaf-2019",
      carName: "Nissan Leaf",
      pickupDistrict: "Galle",
      returnDistrict: "Galle",
      pickupDate: "2025-07-22",
      returnDate: "2025-07-25",
      plan: "daily",
      driver: "without",
      days: 3,
      subtotal: 36000,
      vat: 5400,
      total: 41400,
      status: "Completed",
    },
  ]);

  // Local review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let arr = bookings;
    if (status !== "All") arr = arr.filter((b) => b.status === status);
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (b) =>
          b.id.toLowerCase().includes(s) ||
          (b.carName || "").toLowerCase().includes(s) ||
          (b.pickupDistrict || "").toLowerCase().includes(s) ||
          (b.returnDistrict || "").toLowerCase().includes(s)
      );
    }
    return arr;
  }, [bookings, search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const canCancel = (b) => b.status === "Confirmed" || b.status === "Pending";

  const onCancel = (id) => {
    // TODO: call your API to cancel booking
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
  };

  const viewBooking = (b) => {
    navigate("/confirmation", { state: { booking: b } });
  };

  const openReviewModal = (b) => {
    setActiveBooking(b);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const submitReview = () => {
    if (!activeBooking) return;
    if (!comment.trim()) {
      alert("Please enter a comment before submitting.");
      return;
    }

    // Get current user's display name (optional)
    const me = (() => {
      try {
        return JSON.parse(localStorage.getItem("user-profile") || "{}");
      } catch {
        return {};
      }
    })();
    const displayName = me?.name || "You";

    // Persist review tied to the car (status=pending)
    addReview(activeBooking.carId, {
      bookingId: activeBooking.id,
      name: displayName,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    });

    // Close modal
    setReviewModalOpen(false);
    setActiveBooking(null);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">My Bookings</h1>
          <p className="text-slate-600">Track and manage your reservations</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, car, district…"
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none w-64"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none"
          >
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="px-3 py-3 text-left border-b border-slate-200">Booking</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Trip</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Plan</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Days</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Total</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Status</th>
              <th className="px-3 py-3 text-left border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((b) => {
              const alreadyReviewed = hasReviewed(b.carId, b.id);
              return (
                <tr key={b.id} className="odd:bg-white even:bg-slate-50">
                  <td className="px-3 py-3 align-top">
                    <div className="font-medium">{b.carName}</div>
                    <div className="text-xs text-slate-600 mt-0.5">#{b.id}</div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="text-slate-800">
                      {b.pickupDistrict} → {b.returnDistrict}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {b.pickupDate} – {b.returnDate}
                    </div>
                    <div className="text-xs text-slate-600">
                      {b.driver === "with" ? "With driver" : "Self-drive"}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top capitalize">{b.plan}</td>
                  <td className="px-3 py-3 align-top">{b.days}</td>
                  <td className="px-3 py-3 align-top font-semibold">{LKR(b.total)}</td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        STATUS_COLORS[b.status] || "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => viewBooking(b)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                      >
                        View
                      </button>
                      {canCancel(b) && (
                        <button
                          onClick={() => onCancel(b.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === "Completed" && !alreadyReviewed && (
                        <button
                          onClick={() => openReviewModal(b)}
                          className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          Write Review
                        </button>
                      )}
                      {b.status === "Completed" && alreadyReviewed && (
                        <span className="text-xs text-green-700">Reviewed ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {slice.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{pageCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1.5 rounded-lg border ${
              page <= 1
                ? "border-slate-200 text-slate-300"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            Prev
          </button>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className={`px-3 py-1.5 rounded-lg border ${
              page >= pageCount
                ? "border-slate-200 text-slate-300"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              Review {activeBooking?.carName}
            </h2>
            <div className="mb-3">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    type="button"
                    aria-label={`Set rating ${star}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="text-sm font-medium">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none"
                rows={3}
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                type="button"
              >
                Close
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                type="button"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

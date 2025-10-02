import React, { useState, useMemo } from "react";
import {
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Reply,
  Send,
  X
} from "lucide-react";

const DEMO_REVIEWS = [
  {
    id: "r1",
    car: "Toyota Axio",
    customer: "John Doe",
    rating: 5,
    comment: "Very comfortable ride, highly recommend!",
    date: "2025-08-12",
    status: "Approved",
    reply: "",
  },
  {
    id: "r2",
    car: "Honda Vezel",
    customer: "Sarah Smith",
    rating: 4,
    comment: "Great car but delivery was slightly delayed.",
    date: "2025-08-15",
    status: "Pending",
    reply: "",
  },
  {
    id: "r3",
    car: "Nissan Leaf",
    customer: "Michael Johnson",
    rating: 3,
    comment: "Car was okay, but cleanliness could be improved.",
    date: "2025-08-18",
    status: "Rejected",
    reply: "",
  },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState(DEMO_REVIEWS);
  const [search, setSearch] = useState("");
  const [replyMode, setReplyMode] = useState(null); // Review ID where replying
  const [replyText, setReplyText] = useState("");

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;
    return reviews.filter(
      (r) =>
        r.car.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
    );
  }, [reviews, search]);

  const handleApprove = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
  };

  const handleReject = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleReply = (id) => {
    setReplyMode(id);
    const existingReply = reviews.find((r) => r.id === id)?.reply || "";
    setReplyText(existingReply);
  };

  const saveReply = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: replyText } : r))
    );
    setReplyMode(null);
    setReplyText("");
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Customer Reviews
        </h1>
        <p className="text-sm text-gray-500">
          View, manage, and reply to all customer reviews submitted for your cars.
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by car, customer, or comment..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-200 px-4 py-3 text-left">Car</th>
              <th className="border border-gray-200 px-4 py-3 text-left">Customer</th>
              <th className="border border-gray-200 px-4 py-3 text-left">Rating</th>
              <th className="border border-gray-200 px-4 py-3 text-left">Comment</th>
              <th className="border border-gray-200 px-4 py-3 text-left">Date</th>
              <th className="border border-gray-200 px-4 py-3 text-center">Status</th>
              <th className="border border-gray-200 px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <React.Fragment key={review.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">{review.car}</td>
                    <td className="border border-gray-200 px-4 py-3">{review.customer}</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                            fill={i < review.rating ? "#facc15" : "none"}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 max-w-xs truncate">
                      {review.comment}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">{review.date}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          review.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : review.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReply(review.id)}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title="Reply"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Reply Box */}
                  {replyMode === review.id && (
                    <tr>
                      <td
                        colSpan="7"
                        className="border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setReplyMode(null)}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                            >
                              <X className="h-4 w-4" /> Cancel
                            </button>
                            <button
                              onClick={() => saveReply(review.id)}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              <Send className="h-4 w-4" /> Send Reply
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Show Saved Reply */}
                  {review.reply && (
                    <tr>
                      <td
                        colSpan="7"
                        className="border border-gray-200 bg-blue-50 px-4 py-3"
                      >
                        <p className="text-sm">
                          <span className="font-semibold text-blue-700">
                            Admin Reply:
                          </span>{" "}
                          {review.reply}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="border border-gray-200 px-4 py-6 text-center text-gray-500"
                >
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

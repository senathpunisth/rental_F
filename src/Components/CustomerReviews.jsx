// src/components/CustomerReviews.jsx
import { useEffect, useMemo, useState } from "react";
import { getAllReviews, subscribeReviews } from "../utils/reviews";
import { Star } from "lucide-react";

export default function CustomerReviews({ carId }) {
  const [tick, setTick] = useState(0);

  // Subscribe for real-time updates
  useEffect(() => subscribeReviews(() => setTick((t) => t + 1)), []);

  // Fetch approved reviews for this car only
  const reviews = useMemo(
    () => getAllReviews({ status: "approved" }).filter((r) => r.carId === carId),
    [tick, carId]
  );

  return (
    <section className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

      {reviews.length === 0 && (
        <p className="text-slate-500 text-sm">No reviews yet for this vehicle.</p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.name || "Anonymous"}</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill={i < r.rating ? "#facc15" : "none"}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
            <p className="mt-1 text-xs text-slate-500">Date: {r.date}</p>

            {r.reply && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">
                  Admin Reply ({r.reply.date}):
                </p>
                <p className="text-sm text-blue-900">{r.reply.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

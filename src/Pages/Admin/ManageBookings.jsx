import { useState } from "react";
import {
  ClipboardList,
  Calendar,
  DollarSign,
  BadgeCheck,
  XCircle,
  PauseCircle,
} from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    confirmed: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    offline: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const icon = {
    confirmed: <BadgeCheck className="h-3.5 w-3.5" />,
    pending: <PauseCircle className="h-3.5 w-3.5" />,
    cancelled: <XCircle className="h-3.5 w-3.5" />,
    offline: null,
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${map[status]}`}
    >
      {icon}
      {status}
    </span>
  );
}

const DEMO = [
  {
    id: "BK-2001",
    car: "Toyota Corolla",
    img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop",
    from: "2025-06-28",
    to: "2025-06-29",
    total: 130,
    payment: "offline",
    status: "confirmed",
  },
  {
    id: "BK-2000",
    car: "Toyota Corolla",
    img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop",
    from: "2025-06-25",
    to: "2025-06-27",
    total: 260,
    payment: "offline",
    status: "confirmed",
  },
];

export default function ManageBookings() {
  const [rows, setRows] = useState(DEMO);

  const approve = (id) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r))
    );

  const cancel = (id) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
    );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Manage Bookings
        </h1>
        <p className="text-sm text-gray-500">
          Track all customer bookings, approve or cancel requests, and manage
          booking statuses.
        </p>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-gray-500 border-b">
          <div className="col-span-4">Car</div>
          <div className="col-span-3">Date Range</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3">
              {/* Car */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="h-12 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={r.img}
                    alt={r.car}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {r.car}
                  </div>
                  <div className="text-xs text-gray-500">{r.id}</div>
                </div>
              </div>

              {/* Date range */}
              <div className="col-span-3 flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                {r.from} <span className="text-gray-400">to</span> {r.to}
              </div>

              {/* Total */}
              <div className="col-span-2 flex items-center text-gray-900 font-medium">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                {r.total}
              </div>

              {/* Payment */}
              <div className="col-span-1 flex items-center">
                <StatusBadge status={r.payment} />
              </div>

              {/* Actions / Status */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <StatusBadge status={r.status} />
                {r.status !== "confirmed" && (
                  <button
                    onClick={() => approve(r.id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "cancelled" && (
                  <button
                    onClick={() => cancel(r.id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No bookings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

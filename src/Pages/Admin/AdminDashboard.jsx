// src/Pages/Admin/AdminDashboard.jsx
import {
  Car,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  BadgeCheck,
} from "lucide-react";

/* ---------- Small UI helpers (kept local for plug-and-play) ---------- */
function Card({ className = "", children }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-full ${map[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status === "confirmed" && <BadgeCheck className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

/* ------------------------- Demo data (replace) ------------------------ */
const demoStats = {
  totalCars: 12,
  totalBookings: 2,
  pending: 0,
  confirmed: 2,
  monthlyRevenue: 390, // currency shown in card
};

const demoRecent = [
  { id: "BK-1028", vehicle: "Toyota Corolla", date: "2025-06-24", amount: 130, status: "confirmed" },
  { id: "BK-1027", vehicle: "Toyota Corolla", date: "2025-06-24", amount: 260, status: "confirmed" },
];

/* ---------------------------- Main Dashboard ------------------------- */
export default function AdminDashboard() {
  // TODO: fetch real data here and replace demoStats/demoRecent
  // Example:
  // const { data, isLoading } = useSWR("/api/admin/metrics", fetcher)

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Monitor overall platform performance including total cars, bookings, revenue, and recent activities.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Total Cars" value={demoStats.totalCars} />
        <StatCard icon={ClipboardList} label="Total Bookings" value={demoStats.totalBookings} />
        <StatCard icon={AlertTriangle} label="Pending" value={demoStats.pending} />
        <StatCard icon={CheckCircle2} label="Confirmed" value={demoStats.confirmed} />
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-xs text-gray-500">Latest customer bookings</p>
          </div>
          <div className="px-5 py-3 divide-y divide-gray-100">
            {demoRecent.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.vehicle}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{b.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {b.amount}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Monthly Revenue</h2>
            <p className="text-xs text-gray-500">Revenue for current month</p>
          </div>
          <div className="px-5 py-6">
            <div className="text-sm text-gray-500 mb-1">Total</div>
            <div className="text-4xl font-semibold text-blue-700 flex items-center gap-1">
              <span className="text-blue-400">$</span>
              {demoStats.monthlyRevenue}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Tip: connect this to your payments table and sum all <em>succeeded</em> transactions for the month.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

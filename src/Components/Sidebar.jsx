// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Home,
  Car,
  PlusCircle,
  ClipboardList,
  Wallet,
  Settings,
  LayoutDashboard,
  MessageSquareMore,
  LogOut,
  Lock,
} from "lucide-react";
import { useUiMode } from "../stores/useUiMode";

// -------- Menus --------
const USER_ITEMS = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/cars", icon: Car, label: "All Cars" },
  { to: "/cars/new", icon: PlusCircle, label: "Add Car" }, // entering this route flips to host mode
  { to: "/my-bookings", icon: ClipboardList, label: "My Bookings" },
  { to: "/payments", icon: Wallet, label: "Payments" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const ADMIN_ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/cars", icon: Car, label: "Manage Cars" },
  { to: "/admin/bookings", icon: ClipboardList, label: "Manage Bookings" },
  { to: "/admin/reviews", icon: MessageSquareMore, label: "Reviews" },
];

// Re-usable item: supports disabled state
function Item({ to, icon: Icon, label, disabled = false }) {
  if (disabled) {
    return (
      <div
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
        aria-disabled="true"
        title="Save your car first to unlock this"
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="hidden group-hover:inline truncate">{label}</span>
        <Lock className="ml-auto h-4 w-4 hidden group-hover:inline" />
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
         ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {/* Label visible only when expanded (on hover) */}
      <span className="hidden group-hover:inline truncate">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  // mode: "user" | "host"
  // carAdded: false until AddCar calls markCarAdded()
  const { mode, carAdded } = useUiMode();
  const items = mode === "host" ? ADMIN_ITEMS : USER_ITEMS;

  return (
    <aside
      className="
        group fixed left-0 top-0 h-[100dvh] z-40
        bg-white border-r shadow-sm
        w-16 hover:w-64
        transition-[width] duration-200 ease-out
        flex flex-col
      "
      aria-label="Sidebar"
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-3 border-b">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white grid place-items-center text-sm font-semibold">
          RR
        </div>
        <div className="ml-3 hidden group-hover:block">
          <div className="text-sm font-semibold">RideRight</div>
          <div className="text-xs text-gray-500">Car Rental</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.map((it) => (
          <Item
            key={it.to}
            {...it}
            // While in host mode and no car saved yet, only "Add Car" (route /cars/new or /admin/add-car) is active.
            disabled={
              mode === "host" &&
              !carAdded &&
              it.label !== "Dashboard" && // keep Dashboard locked too unless you want it open
              it.label !== "Add Car" // allow only Add Car until saved
            }
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <button
          type="button"
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => console.log("logout")}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden group-hover:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}

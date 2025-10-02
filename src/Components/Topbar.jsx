import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const authUser = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;

  return (
    // Sticky, sits above the sidebar (z-50). Full width; does not move.
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center">
      <div className="w-full h-full px-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/home")}
          className="font-semibold tracking-wide text-slate-800 hover:text-slate-900"
          aria-label="Go to home"
        >
          CAR RENTING
        </button>

        <div className="flex items-center gap-3">
          {!authUser ? (
            <>
              <Link
                to="/signin"
                className="hidden md:inline px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700"
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/user"
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("authUser");
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

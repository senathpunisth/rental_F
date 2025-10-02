// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Home from "./Pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./Pages/CarDetails";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import UserPage from "./pages/UserPage";
import SignIn from "./pages/SignIn";
import SignUp from "./Pages/SignUp";

import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AddCar from "./Pages/Admin/AddCar";
import ManageCars from "./Pages/Admin/ManageCars";
import ManageBookings from "./Pages/Admin/ManageBookings";
import MyBookings from "./Pages/MyBookings";
import AdminReviews from "./Pages/Admin/AdminReviews";

import HostLayout from "./layouts/HostLayout";
import RequireAuth from "./Components/RequireAuth"

/**
 * Layout:
 * - Sidebar wrapped in "peer" for broad Tailwind support.
 * - Main column has base pl-16 and slides to pl-64 when sidebar hovered.
 */
function Layout({ children }) {
  const { pathname } = useLocation();
  const hideLayout = pathname === "/signin" || pathname === "/signup";

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      {!hideLayout && (
        <div className="peer">
          <Sidebar />
        </div>
      )}

      <div
        className={[
          "min-h-[100dvh] flex flex-col",
          "pl-16",
          !hideLayout ? "peer-hover:pl-64 transition-[padding] duration-200 ease-out" : "",
        ].join(" ")}
      >
        {!hideLayout && <Topbar />}

        <main className="flex-1 min-w-0">
          {children}
          {!hideLayout && <Footer />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public */}
          <Route path="/home" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected (must be signed in) */}
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserPage />
              </RequireAuth>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />

          {/* Host/Admin context (auto-switch sidebar) + protected */}
          <Route element={<HostLayout />}>
            <Route
              path="/cars/new"
              element={
                <RequireAuth>
                  <AddCar />
                </RequireAuth>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/add-car"
              element={
                <RequireAuth>
                  <AddCar />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/cars"
              element={
                <RequireAuth>
                  <ManageCars />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RequireAuth>
                  <ManageBookings />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <RequireAuth>
                  <AdminReviews />
                </RequireAuth>
              }
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex h-screen items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

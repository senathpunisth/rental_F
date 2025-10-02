import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">No booking data</h1>
        <p className="mt-2 text-slate-600">Please complete a booking first.</p>
        <Link to="/cars" className="mt-6 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white">Browse Cars</Link>
      </main>
    );
  }

  const LKR = (n) => "Rs " + Number(n || 0).toLocaleString("en-LK");

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-2xl md:text-3xl font-semibold">Booking Confirmed!</h1>
        <p className="mt-2 text-slate-600">Thank you for your reservation. A confirmation email will be sent shortly.</p>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-left">
          <div className="rounded-xl border p-4">
            <div className="font-medium">Car</div>
            <div className="mt-1 text-slate-700">{booking.carName}</div>
            <div className="mt-1 text-sm text-slate-600">{booking.transmission} • {booking.fuel} • {booking.seats} seats</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Trip</div>
            <div className="mt-1 text-slate-700">{booking.pickupDistrict} → {booking.returnDistrict}</div>
            <div className="mt-1 text-sm text-slate-600">{booking.pickupDate} {booking.pickupTime} → {booking.returnDate} {booking.returnTime}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Renter</div>
            <div className="mt-1 text-slate-700">{booking.renter?.fullName}</div>
            <div className="mt-1 text-sm text-slate-600">{booking.renter?.email} • {booking.renter?.phone}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Payment</div>
            <div className="mt-1 text-slate-700">Subtotal: {LKR(booking.subtotal)}</div>
            <div className="text-slate-700">VAT: {LKR(booking.vat)}</div>
            {booking.discount ? <div className="text-emerald-700">Discount: -{LKR(booking.discount)}</div> : null}
            <div className="mt-1 font-semibold text-slate-900">Total: {LKR(booking.total)}</div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/cars" className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Rent another car</Link>
          <Link to="/user" className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Go to My Account</Link>
        </div>
      </div>
    </main>
  );
}

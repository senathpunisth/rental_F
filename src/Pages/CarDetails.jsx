// src/pages/CarDetails.jsx//hii
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DistrictCitySelector from "../components/DistrictCitySelector";
import CustomerReviews from "../components/CustomerReviews";
import {
  Users,
  Fuel,
  Cog,
  MapPin,
  Gauge,
  CheckCircle2,
  Star,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* Demo images (replace/extend with real gallery images per car) */
import imgAxio from "../assets/download.jpeg";
import imgVezel from "../assets/vezel.jpeg";
import imgLeaf from "../assets/leaf.jpeg";
import imgWagonR from "../assets/wagon r.jpeg";
import imgHero from "../assets/luxury 2.jpg";

/* ---------------- Mock car DB (id should match /cars/:id) ---------------- */
const CAR_DB = {
  "axio-2017": {
    id: "axio-2017",
    name: "Toyota Axio 2017",
    brand: "Toyota",
    type: "Sedan",
    year: 2017,
    seats: 5,
    fuel: "Petrol",
    trans: "Automatic",
    engine: "1.5L",
    mileage: "12–15 km/L",
    priceDaily: 10000,
    priceWeekly: 63000, // 7-day bucket
    priceMonthly: 240000, // 30-day bucket
    driverFeePerDay: 2500,
    locationDefault: { dist: "Colombo", city: "" },
    highlights: ["A/C", "Bluetooth", "Reverse Camera", "ABS", "Airbags"],
    gallery: [imgAxio, imgHero, imgLeaf, imgVezel],
    rating: 4.6,
    ratingCount: 84,
    // availability (inclusive ranges)
    reservations: [
      { start: "2025-09-10", end: "2025-09-14", status: "confirmed" },
      { start: "2025-09-20", end: "2025-09-22", status: "pending" },
      { start: "2025-10-02", end: "2025-10-05", status: "confirmed" },
    ],
  },
  "vezel-2018": {
    id: "vezel-2018",
    name: "Honda Vezel 2018",
    brand: "Honda",
    type: "SUV",
    year: 2018,
    seats: 5,
    fuel: "Hybrid",
    trans: "Semi-Automatic",
    engine: "1.5L Hybrid",
    mileage: "18–20 km/L",
    priceDaily: 12000,
    priceWeekly: 75600,
    priceMonthly: 290000,
    driverFeePerDay: 2500,
    locationDefault: { dist: "Kandy", city: "" },
    highlights: ["A/C", "Cruise Control", "Reverse Camera", "Lane Assist"],
    gallery: [imgVezel, imgHero, imgLeaf, imgAxio],
    rating: 4.7,
    ratingCount: 62,
    reservations: [
      { start: "2025-09-07", end: "2025-09-08", status: "pending" },
      { start: "2025-09-15", end: "2025-09-19", status: "confirmed" },
    ],
  },
  "leaf-2019": {
    id: "leaf-2019",
    name: "Nissan Leaf 2019 (EV)",
    brand: "Nissan",
    type: "EV",
    year: 2019,
    seats: 5,
    fuel: "Electric",
    trans: "Automatic",
    engine: "EV",
    mileage: "200–250 km/charge",
    priceDaily: 9000,
    priceWeekly: 56700,
    priceMonthly: 210000,
    driverFeePerDay: 2500,
    locationDefault: { dist: "Galle", city: "" },
    highlights: ["A/C", "Apple CarPlay", "Rear Sensors", "Fast Charging"],
    gallery: [imgLeaf, imgHero, imgVezel, imgAxio],
    rating: 4.5,
    ratingCount: 41,
    reservations: [{ start: "2025-09-25", end: "2025-09-28", status: "confirmed" }],
  },
  "wagonr-2016": {
    id: "wagonr-2016",
    name: "Suzuki WagonR 2016",
    brand: "Suzuki",
    type: "Hatchback",
    year: 2016,
    seats: 4,
    fuel: "Petrol",
    trans: "Manual",
    engine: "1.0L",
    mileage: "17–20 km/L",
    priceDaily: 6500,
    priceWeekly: 40950,
    priceMonthly: 160000,
    driverFeePerDay: 2500,
    locationDefault: { dist: "Negombo", city: "" },
    highlights: ["A/C", "Compact", "Great Economy"],
    gallery: [imgWagonR, imgHero, imgAxio],
    rating: 4.4,
    ratingCount: 33,
    reservations: [],
  },
};

/* ------------------------- Helpers ------------------------- */
const LKR = (n) => "Rs " + Number(n || 0).toLocaleString("en-LK");

function diffDaysInclusive(start, end) {
  // count days, minimum 1
  const a = new Date(start);
  const b = new Date(end);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(
    1,
    Math.floor(
      (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
        Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
        msPerDay
    )
  );
  return days;
}
function pickTier(days) {
  if (days >= 30) return "monthly";
  if (days >= 7) return "weekly";
  return "daily";
}
function ymdToDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* ---------------- Availability Calendar (inline component) ---------------- */
const fmt = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function expandRange(startStr, endStr) {
  const set = new Set();
  let d = ymdToDate(startStr);
  const end = ymdToDate(endStr);
  while (d <= end) {
    set.add(fmt(d));
    d = addDays(d, 1);
  }
  return set;
}
function buildMonthMatrix(year, monthIndex, startsOnMonday = false) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstWeekday = first.getDay(); // 0=Sun..6=Sat
  const shift = startsOnMonday ? ((firstWeekday + 6) % 7) : firstWeekday;
  const daysInMonth = last.getDate();

  const cells = [];
  for (let i = 0; i < shift; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function AvailabilityCalendar({ reservations = [], monthStart = new Date(), startsOnMonday = false }) {
  const [cursor, setCursor] = useState(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1));

  const statusMap = useMemo(() => {
    const map = new Map();
    // pending first, confirmed overrides
    for (const r of reservations.filter((r) => r.status === "pending")) {
      for (const d of expandRange(r.start, r.end)) map.set(d, "pending");
    }
    for (const r of reservations.filter((r) => r.status === "confirmed")) {
      for (const d of expandRange(r.start, r.end)) map.set(d, "confirmed");
    }
    return map;
  }, [reservations]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = useMemo(() => buildMonthMatrix(year, month, startsOnMonday), [year, month, startsOnMonday]);
  const today = new Date();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const dayLabels = startsOnMonday ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-slate-100"
          title="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-slate-100"
          title="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, idx) => {
          const isNull = d === null;
          const isOutOfMonth = !isNull && d.getMonth() !== month;
          const key = isNull ? `x-${idx}` : fmt(d);
          const st = isNull ? null : statusMap.get(fmt(d)); // 'confirmed'|'pending'|undefined
          const isToday = !isNull && sameDay(d, today);

          let tone = "bg-white border-slate-200";
          if (st === "confirmed") tone = "bg-rose-50 border-rose-300";
          else if (st === "pending") tone = "bg-amber-50 border-amber-300";

          return (
            <div
              key={key}
              className={`aspect-square rounded-lg border text-center flex items-center justify-center
                ${isNull ? "invisible" : ""}
                ${tone}
                ${isOutOfMonth ? "text-slate-400" : "text-slate-800"}
                ${isToday ? "ring-1 ring-blue-400" : ""}
              `}
              title={
                isNull ? "" : st === "confirmed" ? "Booked" : st === "pending" ? "Pending" : "Available"
              }
            >
              {!isNull && <span className="text-xs">{d.getDate()}</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-rose-200 border border-rose-300" /> Booked
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-200 border border-amber-300" /> Pending
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-white border border-slate-300" /> Available
        </span>
      </div>
    </div>
  );
}

/* ------------------------------- Page ------------------------------- */
export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const car = CAR_DB[id] || CAR_DB["axio-2017"];

  // Location (compact selector)
  const [dist, setDist] = useState(car.locationDefault.dist);
  const [city, setCity] = useState(car.locationDefault.city);

  // Dates
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(todayStr);

  // Driver toggle
  const [withDriver, setWithDriver] = useState(false);

  // Gallery
  const [activeImg, setActiveImg] = useState(car.gallery?.[0] || imgHero);

  // Derived pricing (automatic tiers)
  const rentalDays = useMemo(() => diffDaysInclusive(pickupDate, returnDate), [pickupDate, returnDate]);
  const tier = useMemo(() => pickTier(rentalDays), [rentalDays]);

  const perDay =
    tier === "monthly"
      ? car.priceMonthly / 30
      : tier === "weekly"
      ? car.priceWeekly / 7
      : car.priceDaily;

  const driverPerDay = withDriver ? car.driverFeePerDay || 0 : 0;
  const estSubtotal = Math.round(rentalDays * (perDay + driverPerDay));

  // keep return >= pickup
  useEffect(() => {
    if (new Date(returnDate) < new Date(pickupDate)) {
      setReturnDate(pickupDate);
    }
  }, [pickupDate, returnDate]);

  // Disallow picking a confirmed day
  const isDateBooked = (dateStr, reservations = []) => {
    const d = ymdToDate(dateStr);
    for (const r of reservations) {
      if (r.status !== "confirmed") continue;
      const s = ymdToDate(r.start);
      const e = ymdToDate(r.end);
      if (d >= s && d <= e) return true;
    }
    return false;
  };

  const onPickupChange = (v) => {
    if (isDateBooked(v, car.reservations)) {
      alert("That pickup date is already booked. Please choose another date.");
      return;
    }
    setPickupDate(v);
    if (new Date(returnDate) < new Date(v)) setReturnDate(v);
  };

  const onReturnChange = (v) => {
    if (isDateBooked(v, car.reservations)) {
      alert("That return date overlaps a booked day. Please choose another date.");
      return;
    }
    setReturnDate(v);
  };

  const onCheckout = () => {
    const params = new URLSearchParams({
      carId: car.id,
      dist,
      city,
      pickupDate,
      returnDate,
      withDriver: String(withDriver),
      days: String(rentalDays),
      tier,
      perDay: String(perDay), // re-calc server-side
      subtotal: String(estSubtotal),
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Top: Title + rating */}
      <header className="mb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{car.name}</h1>
            <p className="text-slate-600">
              {car.brand} • {car.type} • {car.year}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{car.rating.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">({car.ratingCount} reviews)</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Gallery + details + reviews */}
        <section className="lg:col-span-2">
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <div className="aspect-[16/9] bg-slate-100">
              <img src={activeImg} alt={car.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex gap-3 overflow-x-auto bg-white">
              {(car.gallery || [activeImg]).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border transition ${
                    activeImg === src ? "border-blue-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setActiveImg(src)}
                >
                  <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Specs & highlights */}
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-xs text-slate-500">Seats</div>
                <div className="font-medium text-slate-900">{car.seats}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <Fuel className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-xs text-slate-500">Fuel</div>
                <div className="font-medium text-slate-900">{car.fuel}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <Cog className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-xs text-slate-500">Transmission</div>
                <div className="font-medium text-slate-900">{car.trans}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <Gauge className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-xs text-slate-500">Engine</div>
                <div className="font-medium text-slate-900">{car.engine}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <CircleUserRound className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-xs text-slate-500">Mileage</div>
                <div className="font-medium text-slate-900">{car.mileage}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Highlights</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {car.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs border border-blue-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews: ONLY approved, for this vehicle */}
          <div className="mt-6">
            <CustomerReviews carId={car.id} />
          </div>
        </section>

        {/* RIGHT: Booking card */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sticky top-4">
            {/* Auto pricing tier display */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-500">Estimated total</div>
                <div className="text-2xl font-semibold text-slate-900">{LKR(estSubtotal)}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {rentalDays} day{rentalDays > 1 ? "s" : ""} • Auto tier:{" "}
                  <span className="font-medium text-blue-700 capitalize">{tier}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Base ({tier})</div>
                <div className="font-medium">
                  {tier === "daily" && LKR(CAR_DB[car.id].priceDaily) + " /day"}
                  {tier === "weekly" && LKR(CAR_DB[car.id].priceWeekly) + " /7 days"}
                  {tier === "monthly" && LKR(CAR_DB[car.id].priceMonthly) + " /30 days"}
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="mt-4">
              <AvailabilityCalendar reservations={car.reservations || []} />
            </div>

            {/* Location (compact) */}
            <div className="mt-4">
              <DistrictCitySelector
                dist={dist}
                setDist={setDist}
                city={city}
                setCity={setCity}
                label="Pickup Location"
                small
              />
            </div>

            {/* Dates */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pickup</label>
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr}
                  onChange={(e) => onPickupChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => onReturnChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Driver toggle */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 p-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={withDriver}
                  onChange={(e) => setWithDriver(e.target.checked)}
                />
                Add Driver ({LKR(car.driverFeePerDay)}/day)
              </label>
              <div className="text-xs text-slate-500">Optional</div>
            </div>

            {/* Fee breakdown */}
            <div className="mt-3 text-sm rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="flex justify-between">
                <span>
                  Car ({rentalDays} × {LKR(perDay)})
                </span>
                <span className="font-medium">{LKR(rentalDays * perDay)}</span>
              </div>
              {withDriver && (
                <div className="flex justify-between mt-1">
                  <span>
                    Driver ({rentalDays} × {LKR(car.driverFeePerDay)})
                  </span>
                  <span className="font-medium">{LKR(rentalDays * car.driverFeePerDay)}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex justify-between">
                <span className="font-medium text-slate-900">Estimated Total</span>
                <span className="font-semibold text-slate-900">{LKR(estSubtotal)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Final amount may vary with insurance/deposits at pickup. Auto tier is chosen by trip length
                (daily &lt; 7, weekly ≥ 7, monthly ≥ 30).
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={onCheckout}
              className="mt-4 w-full rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Continue to Checkout
            </button>

            {/* Pickup summary */}
            <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>
                Pickup: <span className="font-medium">{dist}</span>
                {city ? ` • ${city}` : ""}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

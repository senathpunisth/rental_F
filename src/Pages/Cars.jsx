// src/pages/Cars.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Local images used as graceful fallbacks when a car has no image_url
import axio from "../assets/download.jpeg";
import vezel from "../assets/vezel.jpeg";
import leaf from "../assets/leaf.jpeg";
import wagonr from "../assets/wagon r.jpeg";
import luxury1 from "../assets/luxury.jpeg";
import luxury2 from "../assets/luxury 2.jpg";
import suv from "../assets/suv.jpeg";
import economy from "../assets/economy.jpeg";

const API_URL = "http://localhost:5050/api/cars";

const TYPES = ["All", "Sedan", "SUV", "Hatchback", "EV", "Luxury", "Economy"];
const SORTS = [
  { id: "reco", label: "Recommended" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "name_asc", label: "Name: A → Z" },
];

// quick map to a decent fallback image by type/brand/name (best-effort)
function fallbackImageFor(car) {
  const name = (car?.name || "").toLowerCase();
  const brand = (car?.brand || "").toLowerCase();
  const type = (car?.type || "").toLowerCase();

  if (name.includes("axio")) return axio;
  if (name.includes("vezel")) return vezel;
  if (name.includes("leaf")) return leaf;
  if (name.includes("wagon")) return wagonr;
  if (name.includes("7 series")) return Math.random() > 0.5 ? luxury1 : luxury2;

  if (brand.includes("bmw")) return luxury1;
  if (brand.includes("toyota") && type.includes("suv")) return suv;

  if (type.includes("suv")) return suv;
  if (type.includes("luxury")) return luxury1;
  if (type.includes("hatch")) return wagonr;
  if (type.includes("ev") || type.includes("electric")) return leaf;
  if (type.includes("economy")) return economy;

  // last resort
  return economy;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Cars() {
  const query = useQuery();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("reco");

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // read initial filters from /cars?type=...&q=...&sort=...
  useEffect(() => {
    const qParam = query.get("q") || "";
    const tParam = query.get("type") || "All";
    const sParam = query.get("sort") || "reco";

    setQ(qParam);
    if (TYPES.includes(tParam)) setType(tParam);
    if (SORTS.map((s) => s.id).includes(sParam)) setSort(sParam);
  }, [query]);

  // keep URL in sync when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    navigate({ pathname: "/cars", search: params.toString() }, { replace: true });
  }, [q, type, sort, navigate]);

  // Debounce search for better UX
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // fetch from backend whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams();
        if (type) params.set("type", type);               // 'All' is accepted by backend
        if (debouncedQ) params.set("search", debouncedQ); // backend expects 'search'
        if (sort) params.set("sort", sort);

        const res = await fetch(`${API_URL}?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Normalize keys to match UI expectations
        const normalized = (data || []).map((c) => ({
          id: c.id?.toString() ?? "",
          name: c.name ?? "",
          brand: c.brand ?? "",
          year: c.year ?? null,
          type: c.type ?? "",
          seats: Number(c.seats ?? 0),
          transmission: c.transmission ?? "",
          fuel: c.fuel ?? "",
          pricePerDay:
            typeof c.price_per_day === "number"
              ? c.price_per_day
              : typeof c.pricePerDay === "number"
              ? c.pricePerDay
              : Number(c.price_per_day ?? c.pricePerDay ?? 0),
          img: c.img || c.image_url || null,
          description: c.description ?? "",
        }));

        setCars(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fetch cars failed:", e);
          setErr("Failed to load cars. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [type, debouncedQ, sort]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">All Cars</h1>
        <div className="flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
            placeholder="Search by name, brand or type"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status row */}
      <div className="mt-2 text-sm text-slate-600">
        {loading ? (
          <span>Loading cars…</span>
        ) : err ? (
          <span className="text-rose-600">{err}</span>
        ) : (
          <>
            Showing <span className="font-medium">{cars.length}</span> car
            {cars.length !== 1 ? "s" : ""}
          </>
        )}
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Skeletons while loading */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
                <div className="h-5 w-1/3 bg-slate-100 animate-pulse rounded" />
              </div>
            </div>
          ))}

        {!loading &&
          !err &&
          cars.map((car) => {
            const imgSrc = car.img || fallbackImageFor(car);
            const detailsHref = `/cars/${car.id}`;

            return (
              <Link
                to={detailsHref}
                key={car.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition block"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={imgSrc}
                    alt={car.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImageFor(car);
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{car.name}</h3>
                    <span className="text-sm text-slate-500">{car.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {car.transmission} • {car.seats} seats
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      Rs {Number(car.pricePerDay || 0).toLocaleString()}
                    </span>
                    <span className="px-3 py-1.5 text-sm rounded-xl bg-slate-900 text-white">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      {/* Empty state */}
      {!loading && !err && cars.length === 0 && (
        <div className="mt-12 text-center text-slate-500">
          No cars match your filters.
        </div>
      )}
    </main>
  );
}

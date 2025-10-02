// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerReviews from "../components/CustomerReviews";
import {
  Users,
  Fuel,
  Cog,
  MapPin,
  ChevronDown,
  Search as SearchIcon,
} from "lucide-react";

/* Images */
import heroImg from "../assets/luxury 2.jpg";
import catEconomy from "../assets/economy.jpeg";
import catSuv from "../assets/suv.jpeg";
import catLuxury from "../assets/luxury.jpeg";
import dealAxio from "../assets/download.jpeg";
import dealVezel from "../assets/vezel.jpeg";
import dealLeaf from "../assets/leaf.jpeg";
import dealWagonr from "../assets/wagon r.jpeg";

/* Districts & Cities */
const SL_DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla",
  "Monaragala","Ratnapura","Kegalle",
];

const DISTRICTS_WITH_CITIES = {
  Colombo: ["Colombo 01","Colombo 02","Colombo 03","Dehiwala","Kaduwela","Nugegoda","Moratuwa","Maharagama"],
  Gampaha: ["Gampaha","Negombo","Ja-Ela","Wattala","Kadawatha","Minuwangoda","Kiribathgoda"],
  Kalutara: ["Kalutara","Panadura","Horana","Wadduwa"],
  Kandy: ["Kandy City","Peradeniya","Katugastota","Gampola","Akurana"],
  Matale: ["Matale","Dambulla","Ukuwela"],
  "Nuwara Eliya": ["Nuwara Eliya","Hatton","Ginigathhena"],
  Galle: ["Galle City","Unawatuna","Hikkaduwa","Weligama"],
  Matara: ["Matara City","Weligama","Dikwella","Hakmana"],
  Hambantota: ["Hambantota","Tangalle","Tissamaharama"],
  Jaffna: ["Jaffna City","Nallur","Chavakachcheri"],
  Trincomalee: ["Trincomalee Town","Kinniya","Nilaveli"],
  Batticaloa: ["Batticaloa","Eravur","Kattankudy"],
  Ampara: ["Ampara","Akkaraipattu","Kalmunai"],
  Kurunegala: ["Kurunegala City","Kuliyapitiya","Mawathagama","Pannala"],
  Puttalam: ["Puttalam","Chilaw","Wennappuwa"],
  Anuradhapura: ["Anuradhapura City","Mihintale","Thambuththegama"],
  Polonnaruwa: ["Polonnaruwa","Hingurakgoda"],
  Badulla: ["Badulla","Bandarawela","Hali Ela"],
  Monaragala: ["Monaragala","Wellawaya","Bibile"],
  Ratnapura: ["Ratnapura","Balangoda","Pelmadulla"],
  Kegalle: ["Kegalle","Mawanella","Warakapola"],
  Vavuniya: ["Vavuniya"],
  Mullaitivu: ["Mullaitivu"],
  Kilinochchi: ["Kilinochchi"],
  Mannar: ["Mannar"],
};

/* Utils */
function useTodayAndTomorrow() {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000), []);
  const toStr = (d) => d.toISOString().slice(0, 10);
  return { todayStr: toStr(today), tomorrowStr: toStr(tomorrow) };
}

/* Slide-down container */
function Collapse({ open, children, className = "" }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    setH(open ? ref.current.scrollHeight : 0);
  }, [open, children]);
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${className}`}
      style={{ maxHeight: h }}
      aria-hidden={!open}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

/* ============================= HERO (compact + "More filters") ============================= */
function Hero() {
  const navigate = useNavigate();
  const { todayStr, tomorrowStr } = useTodayAndTomorrow();

  const [dist, setDist] = useState("Colombo");
  const [city, setCity] = useState("");
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(tomorrowStr);
  const [type, setType] = useState("All");

  // Advanced filters (More)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [trans, setTrans] = useState("All");
  const [fuel, setFuel] = useState("All");
  const [seats, setSeats] = useState("All");

  const [showMore, setShowMore] = useState(false);

  useEffect(() => setCity(""), [dist]);

  const onPickupChange = (v) => {
    setPickupDate(v);
    if (new Date(returnDate) < new Date(v)) setReturnDate(v);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      dist,
      city: city || "All",
      pickupDate,
      returnDate,
      type,
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(trans && trans !== "All" ? { trans } : {}),
      ...(fuel && fuel !== "All" ? { fuel } : {}),
      ...(seats && seats !== "All" ? { seats } : {}),
    });
    navigate(`/cars?${params.toString()}`);
  };

  const onResetMore = () => {
    setMinPrice("");
    setMaxPrice("");
    setTrans("All");
    setFuel("All");
    setSeats("All");
  };

  const cityOptions = DISTRICTS_WITH_CITIES[dist] || [];

  // Common compact field classes
  const fieldBase =
    "w-full rounded-md border border-slate-300 outline-none focus:border-blue-400 text-xs";
  const inputCls = `${fieldBase} px-2.5 py-1`;
  const selectCls = `${fieldBase} px-2.5 py-1 appearance-none bg-white`;
  const labelCls = "block text-[11px] font-medium text-slate-600 mb-1";
  const iconLeftCls = "absolute left-2.5 top-1/2 -translate-y-1/2";
  const chevronCls = "absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

  return (
    <section aria-label="Hero Search" className="relative">
      <div
        className="h-[320px] md:h-[420px] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/40" />
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto w-full px-6 pb-6">
          <h1 className="text-white text-2xl md:text-4xl font-semibold drop-shadow">
            Drive Sri Lanka — easy, affordable, reliable
          </h1>
          <p className="text-white/90 mt-1 md:text-lg">
            Search thousands of cars with transparent pricing.
          </p>

          {/* Search bar */}
          <form
            onSubmit={onSubmit}
            className="mt-4 bg-white/95 backdrop-blur p-3 rounded-2xl border border-blue-100 shadow-md"
          >
            {/* Primary row (Search button at far-right on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2">
              {/* District */}
              <div className="lg:col-span-2">
                <label className={labelCls}>District</label>
                <div className="relative">
                  <MapPin className={`w-3 h-3 ${iconLeftCls} text-blue-600`} />
                  <select
                    value={dist}
                    onChange={(e) => setDist(e.target.value)}
                    className={`${selectCls} pl-7 pr-6`}
                  >
                    {SL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3 h-3 ${chevronCls}`} />
                </div>
              </div>

              {/* City */}
              <div className="lg:col-span-2">
                <Collapse open={!!dist}>
                  <label className={labelCls}>City</label>
                  <div className="relative">
                    <SearchIcon className={`w-3 h-3 ${iconLeftCls} text-slate-400`} />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${selectCls} pl-7 pr-6`}
                    >
                      <option value="">All Cities</option>
                      {cityOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className={`w-3 h-3 ${chevronCls}`} />
                  </div>
                </Collapse>
              </div>

              {/* Pickup */}
              <div>
                <label className={labelCls}>Pickup</label>
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr}
                  onChange={(e) => onPickupChange(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              {/* Return */}
              <div>
                <label className={labelCls}>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              {/* Car Type + More */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className={labelCls}>Car Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={selectCls}
                  >
                    <option>All</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                    <option>EV</option>
                    <option>Luxury</option>
                    <option>Economy</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMore((s) => !s)}
                  className="h-[34px] shrink-0 px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs hover:bg-slate-50"
                  aria-expanded={showMore}
                  aria-controls="more-filters"
                >
                  {showMore ? "Less" : "More"}
                </button>
              </div>

              {/* Search button — FAR RIGHT on desktop, full-width on mobile */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full h-[34px] rounded-md bg-blue-600 text-white px-3 text-xs font-medium hover:bg-blue-700 shadow-sm"
                  aria-label="Search cars"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Advanced filters (collapsible) */}
            <Collapse open={showMore} className="mt-2">
              <div id="more-filters" className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                  {/* Min Price */}
                  <div>
                    <label className={labelCls}>Min Price (LKR)</label>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="e.g. 5000"
                      className={inputCls}
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className={labelCls}>Max Price (LKR)</label>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="e.g. 15000"
                      className={inputCls}
                    />
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className={labelCls}>Transmission</label>
                    <select
                      value={trans}
                      onChange={(e) => setTrans(e.target.value)}
                      className={selectCls}
                    >
                      <option>All</option>
                      <option>Automatic</option>
                      <option>Manual</option>
                      <option>Semi-Automatic</option>
                    </select>
                  </div>

                  {/* Fuel */}
                  <div>
                    <label className={labelCls}>Fuel Type</label>
                    <select
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value)}
                      className={selectCls}
                    >
                      <option>All</option>
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>Hybrid</option>
                      <option>Electric</option>
                    </select>
                  </div>

                  {/* Seats */}
                  <div>
                    <label className={labelCls}>Seats</label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className={selectCls}
                    >
                      <option>All</option>
                      <option>2</option>
                      <option>4</option>
                      <option>5</option>
                      <option>7</option>
                    </select>
                  </div>

                  {/* Reset Advanced */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={onResetMore}
                      className="w-full h-[34px] rounded-md border border-slate-300 bg-white text-slate-700 text-xs hover:bg-slate-50"
                      title="Clear advanced filters"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </Collapse>
          </form>

          {/* Highlights */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/90">
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">No hidden fees</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">Free cancellation (48h)</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================= Featured Vehicles ======================= */
function FeaturedVehicles() {
  const deals = [
    { id: "axio-2017", name: "Toyota Axio", price: 10000, img: dealAxio, tag: "Available Now", type: "Sedan", year: 2017, seats: 5, fuel: "Petrol", trans: "Automatic", location: "Colombo" },
    { id: "vezel-2018", name: "Honda Vezel", price: 12000, img: dealVezel, tag: "Available Now", type: "SUV", year: 2018, seats: 5, fuel: "Hybrid", trans: "Semi-Automatic", location: "Kandy" },
    { id: "leaf-2019", name: "Nissan Leaf", price: 9000, img: dealLeaf, tag: "Available Now", type: "EV", year: 2019, seats: 5, fuel: "Electric", trans: "Automatic", location: "Galle" },
    { id: "wagonr-2016", name: "Suzuki WagonR", price: 6500, img: dealWagonr, tag: "Available Now", type: "Hatchback", year: 2016, seats: 4, fuel: "Petrol", trans: "Manual", location: "Negombo" },
  ];
  const LKR = (n) => "Rs " + Number(n).toLocaleString("en-LK");

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-semibold">Featured Vehicles</h2>
        <p className="text-slate-600 mt-2">Explore our selection of premium vehicles available for your next adventure.</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {deals.map((d) => (
          <article key={d.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition">
            <div className="relative aspect-[16/9] bg-slate-100">
              <img className="w-full h-full object-cover" src={d.img} alt={d.name} />
              <span className="absolute top-3 left-3 text-[12px] px-2.5 py-1 rounded-full bg-blue-600 text-white shadow">{d.tag}</span>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 text-white text-sm shadow">
                {LKR(d.price)} <span className="text-white/80">/ day</span>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold text-slate-900">{d.name}</div>
              <div className="text-slate-600 text-sm">{d.type} • {d.year}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /><span>{d.seats} Seats</span></div>
                <div className="flex items-center gap-2"><Fuel className="w-4 h-4 text-slate-500" /><span>{d.fuel}</span></div>
                <div className="flex items-center gap-2"><Cog className="w-4 h-4 text-slate-500" /><span>{d.trans}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" /><span>{d.location}</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to={`/cars/${d.id}`} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Book Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ======================= Popular Categories ======================= */
function PopularCategories() {
  const cats = [
    { name: "Economy", img: catEconomy },
    { name: "SUV", img: catSuv },
    { name: "Luxury", img: catLuxury },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Popular Categories</h2>
        <Link to="/cars" className="px-4 py-2 rounded-xl border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-sm">
          View All Cars
        </Link>
      </div>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <article key={c.name} className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition">
            <div className="aspect-[16/9] bg-slate-100">
              <img className="w-full h-full object-cover" src={c.img} alt={c.name} />
            </div>
            <div className="p-4">
              <div className="font-semibold">{c.name}</div>
              <div className="mt-2 flex items-center justify-end">
                <Link to={`/cars?type=${encodeURIComponent(c.name)}&q=`} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  View
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================ Benefits ============================ */
function Benefits() {
  const items = [
    { title: "Transparent Pricing", desc: "No hidden fees. What you see is what you pay." },
    { title: "Island-wide Coverage", desc: "Pick up and return from any major district." },
    { title: "Quality Vehicles", desc: "Well-maintained cars across every category." },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="rounded-2xl border border-blue-100 bg-white p-6">
        <h2 className="text-xl md:text-2xl font-semibold">Why Choose Us</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-slate-200 p-4 bg-blue-50/40">
              <div className="font-semibold text-slate-900">{it.title}</div>
              <p className="text-slate-700 text-sm mt-1">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================== How It Works ========================== */
function HowItWorks() {
  const steps = [
    { n: 1, t: "Search & Compare", d: "Choose location, dates, and car type. Filter to find your match." },
    { n: 2, t: "Book Securely", d: "Add-ons, insurance, and promo codes at checkout—no surprises." },
    { n: 3, t: "Pick Up & Drive", d: "Collect in your district or request delivery. Enjoy the ride!" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-xl md:text-2xl font-semibold">How It Works</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">{s.n}</div>
            <div className="mt-3 font-semibold">{s.t}</div>
            <p className="text-slate-600 text-sm mt-1">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =============================== CTA ============================== */
function CTABanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-12">
      <div className="rounded-2xl bg-blue-600 text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 shadow">
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-semibold">Ready for your next trip?</h3>
          <p className="text-white/90 mt-1">Find the best car at the best price — in minutes.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/cars" className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-white/90 font-medium">Browse Cars</Link>
          <Link to="/user" className="px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10 text-white font-medium">My Account</Link>
        </div>
      </div>
    </section>
  );
}

/* =============================== PAGE ============================= */
export default function Home() {
  return (
    <main className="pb-10 bg-white">
      <Hero />
      <FeaturedVehicles />
      <PopularCategories />
      <Benefits />
      <HowItWorks />
      <CustomerReviews />
      <CTABanner />
    </main>
  );
}

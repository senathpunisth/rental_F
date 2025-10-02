import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Sri Lanka districts */
const SL_DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla",
  "Monaragala","Ratnapura","Kegalle",
];

// Auto plan discount map (mirrors CarDetails)
const PLAN_DISCOUNT = { daily: 0, weekly: 10, monthly: 20 };

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Checkout() {
  const query = useQuery();
  const navigate = useNavigate();

  // Base car + context passed from CarDetails
  const initialCar = {
    id: query.get("id") || "axio-2017",
    name: query.get("name") || "Toyota Axio 2017",
    image: query.get("img") || "https://via.placeholder.com/160x120?text=Car",
    dailyRate: Number(query.get("rate") || 10000), // base (self-drive, no discount)
    transmission: query.get("trans") || "Automatic",
    fuel: query.get("fuel") || "Petrol",
    seats: Number(query.get("seats") || 5),
  };

  const driver = (query.get("driver") || "without");          // 'with' | 'without'
  const driverFeePerDay = Number(query.get("driverFee") || 3500);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [pickupDate, setPickupDate] = useState(query.get("pickupDate") || todayStr);
  const [returnDate, setReturnDate] = useState(query.get("returnDate") || tomorrowStr);
  const [pickupTime, setPickupTime] = useState(query.get("pickupTime") || "10:00");
  const [returnTime, setReturnTime] = useState(query.get("returnTime") || "10:00");
  const [pickupDistrict, setPickupDistrict] = useState(query.get("pickupDist") || "Colombo");
  const [returnDistrict, setReturnDistrict] = useState(query.get("returnDist") || "Colombo");

  const [renter, setRenter] = useState({ fullName: "", email: "", phone: "", nicOrPassport: "" });

  const [addons, setAddons] = useState({
    gps: false,
    childSeat: false,
    extraDriver: false,
    fullInsurance: true,
    delivery: false,
  });

  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // {code, percent}
  const [agree, setAgree] = useState(false);

  // Rental days
  const rentalDays = useMemo(() => {
    const d1 = new Date(`${pickupDate}T${pickupTime || "00:00"}:00`);
    const d2 = new Date(`${returnDate}T${returnTime || "00:00"}:00`);
    const ms = Math.max(0, d2 - d1);
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [pickupDate, returnDate, pickupTime, returnTime]);

  // Auto plan from rental length
  const autoPlan = useMemo(() => {
    if (rentalDays >= 30) return "monthly";
    if (rentalDays >= 7) return "weekly";
    return "daily";
  }, [rentalDays]);

  const planDiscPercent = PLAN_DISCOUNT[autoPlan] || 0;

  // --- Pricing math (plan + driver) ---
  const baseDailyWithDriver = useMemo(() => {
    const add = driver === "with" ? driverFeePerDay : 0;
    return initialCar.dailyRate + add;
  }, [initialCar.dailyRate, driver, driverFeePerDay]);

  const baseBeforePlanDiscount = useMemo(
    () => rentalDays * baseDailyWithDriver,
    [rentalDays, baseDailyWithDriver]
  );

  const planDiscountAmount = useMemo(
    () => Math.round(baseBeforePlanDiscount * (planDiscPercent / 100)),
    [baseBeforePlanDiscount, planDiscPercent]
  );

  // Add-ons & totals
  const fees = useMemo(() => {
    const base = baseBeforePlanDiscount - planDiscountAmount;

    const gps = addons.gps ? 600 * rentalDays : 0;
    const childSeat = addons.childSeat ? 500 * rentalDays : 0;
    const extraDriver = addons.extraDriver ? 1000 * rentalDays : 0;
    const fullInsurance = addons.fullInsurance ? 2500 : 0;

    const deliveryNeeded = addons.delivery || pickupDistrict !== returnDistrict;
    const delivery = deliveryNeeded ? 1500 : 0;

    let subtotal = base + gps + childSeat + extraDriver + fullInsurance + delivery;

    let promoDiscount = 0;
    if (appliedPromo?.percent) {
      promoDiscount = Math.round((subtotal * appliedPromo.percent) / 100);
      subtotal -= promoDiscount;
    }

    const vat = Math.round(subtotal * 0.15);
    const total = subtotal + vat;

    return {
      baseBeforePlanDiscount,
      planDiscountAmount,
      baseAfterPlan: base,
      gps,
      childSeat,
      extraDriver,
      fullInsurance,
      delivery,
      promoDiscount,
      vat,
      total,
      subtotal,
    };
  }, [
    rentalDays,
    baseBeforePlanDiscount,
    planDiscountAmount,
    addons,
    pickupDistrict,
    returnDistrict,
    appliedPromo,
  ]);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promo.trim().toUpperCase();
    if (!code) return;
    const promos = { SAVE10: 10, WELCOME5: 5 };
    const percent = promos[code] || 0;
    if (percent > 0) setAppliedPromo({ code, percent });
    else {
      alert("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const placeOrder = (e) => {
    e.preventDefault();
    if (!renter.fullName || !renter.email || !renter.phone || !renter.nicOrPassport) {
      alert("Please complete renter information.");
      return;
    }
    if (!agree) {
      alert("Please accept the Terms & Conditions.");
      return;
    }

    const bookingData = {
      carId: initialCar.id,
      carName: initialCar.name,
      rate: initialCar.dailyRate,
      transmission: initialCar.transmission,
      fuel: initialCar.fuel,
      seats: initialCar.seats,
      image: initialCar.image,

      pickupDistrict,
      returnDistrict,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,

      // Summary fields
      plan: autoPlan,
      driver,
      driverFeePerDay,
      planDiscPercent,

      renter,
      rentalDays,

      addons: fees.gps + fees.childSeat + fees.extraDriver + fees.fullInsurance + fees.delivery,
      discount: fees.promoDiscount,
      planDiscount: fees.planDiscountAmount,
      vat: fees.vat,
      subtotal: fees.subtotal,
      total: fees.total,
      promo: appliedPromo?.code || null,
    };

    navigate("/confirmation", { state: { booking: bookingData } });
  };

  useEffect(() => {
    const d1 = new Date(pickupDate);
    const d2 = new Date(returnDate);
    if (d2 < d1) setReturnDate(pickupDate);
  }, [pickupDate, returnDate]);

  const LKR = (n) => "Rs " + Number(n || 0).toLocaleString("en-LK");

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Checkout</h1>
      <p className="text-slate-600 mt-1">Review your booking and complete payment</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left */}
        <section className="lg:col-span-2 space-y-6">
          {/* Car Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Car Summary</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-28 h-20 bg-slate-100 rounded-lg overflow-hidden border">
                <img
                  src={initialCar.image}
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/160x120?text=Car")}
                  alt={initialCar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{initialCar.name}</div>
                <div className="text-sm text-slate-600">
                  {initialCar.transmission} · {initialCar.fuel} · {initialCar.seats} seats
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">{LKR(initialCar.dailyRate)}</span> / day (base)
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Plan: <span className="capitalize">{autoPlan}</span> · Driver: {driver === "with" ? "With driver" : "Self-drive"}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <div>Days: <span className="font-semibold">{rentalDays}</span></div>
                <div>Base: <span className="font-semibold">{LKR(fees.baseBeforePlanDiscount)}</span></div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Rental Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Pick-up District</label>
                <select
                  value={pickupDistrict}
                  onChange={(e) => setPickupDistrict(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Return District</label>
                <select
                  value={returnDistrict}
                  onChange={(e) => setReturnDistrict(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Pick-up Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Pick-up Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Return Time</label>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Renter Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Renter Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  value={renter.fullName}
                  onChange={(e) => setRenter({ ...renter, fullName: e.target.value })}
                  placeholder="Your name"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={renter.email}
                  onChange={(e) => setRenter({ ...renter, email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  value={renter.phone}
                  onChange={(e) => setRenter({ ...renter, phone: e.target.value })}
                  placeholder="+94 7X XXX XXXX"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">NIC/Passport</label>
                <input
                  value={renter.nicOrPassport}
                  onChange={(e) => setRenter({ ...renter, nicOrPassport: e.target.value })}
                  placeholder="NIC or Passport Number"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Add-ons</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {[
                { key: "gps", label: "GPS Navigation", price: "Rs 600/day" },
                { key: "childSeat", label: "Child Seat", price: "Rs 500/day" },
                { key: "extraDriver", label: "Extra Driver", price: "Rs 1000/day" },
                { key: "fullInsurance", label: "Full Insurance", price: "Rs 2500 (flat)" },
                { key: "delivery", label: "Doorstep Delivery/Pickup", price: "Rs 1500 (flat)" },
              ].map((a) => (
                <label key={a.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={addons[a.key]}
                    onChange={(e) => setAddons({ ...addons, [a.key]: e.target.checked })}
                  />
                  <span className="flex-1">
                    <span className="font-medium">{a.label}</span>{" "}
                    <span className="text-slate-600 text-sm">({a.price})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <form onSubmit={placeOrder} className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Payment</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Card Number</label>
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Cardholder Name</label>
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder="Name on card"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Expiry (MM/YY)</label>
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="09/27"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">CVC</label>
                <input
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  placeholder="123"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            {/* Promo */}
            <div className="mt-4 flex items-center gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Promo code (e.g., SAVE10)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
              <button onClick={applyPromo} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50">
                Apply
              </button>
            </div>

            {/* Agree */}
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the Terms & Conditions
            </label>

            <button type="submit" className="mt-4 w-full rounded-xl bg-orange-500 text-white py-2 font-medium hover:bg-orange-600">
              Confirm & Pay
            </button>
          </form>
        </section>

        {/* Right: Summary */}
        <aside className="h-fit lg:sticky top-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Daily base {driver === "with" ? "(with driver)" : ""}</span>
              <span className="font-medium">{LKR(baseDailyWithDriver)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Days</span>
              <span className="font-medium">{rentalDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal (before plan)</span>
              <span className="font-medium">{LKR(baseBeforePlanDiscount)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700">
              <span>Plan ({autoPlan}, {planDiscPercent}% off)</span>
              <span className="font-medium">- {LKR(planDiscountAmount)}</span>
            </div>

            {/* Add-ons */}
            <div className="pt-2 mt-2 border-t border-slate-200">
              <div className="text-slate-500">Add-ons</div>
              {fees.gps ? <Row label="GPS" value={LKR(fees.gps)} /> : null}
              {fees.childSeat ? <Row label="Child Seat" value={LKR(fees.childSeat)} /> : null}
              {fees.extraDriver ? <Row label="Extra Driver" value={LKR(fees.extraDriver)} /> : null}
              {fees.fullInsurance ? <Row label="Full Insurance" value={LKR(fees.fullInsurance)} /> : null}
              {fees.delivery ? <Row label="Delivery / Pickup" value={LKR(fees.delivery)} /> : null}
            </div>

            {/* Promo */}
            {fees.promoDiscount ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Promo</span>
                <span className="font-medium">- {LKR(fees.promoDiscount)}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200">
              <span>Subtotal</span>
              <span className="font-semibold">{LKR(fees.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>VAT (15%)</span>
              <span className="font-medium">{LKR(fees.vat)}</span>
            </div>
            <div className="flex items-center justify-between text-base pt-2 mt-2 border-t border-slate-200">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{LKR(fees.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

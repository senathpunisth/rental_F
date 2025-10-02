import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Layers,
  DollarSign,
  Calendar as CalendarIcon,
  Eraser,
  PlusCircle,
  X,
  UploadCloud,
} from "lucide-react";

const API_URL = "http://localhost:5050/api/cars";

/* ---------------- Small helpers ---------------- */
function Badge({ tone = "green", children }) {
  const toneMap = {
    green: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
}

const STATUS = { BOOKED: "booked", PENDING: "pending", FREE: "free", CLEAR: "clear" };
const TILE_CLASS = {
  [STATUS.BOOKED]: "bg-rose-500 text-white rounded-full !font-semibold",
  [STATUS.PENDING]: "bg-amber-400 text-black rounded-full !font-semibold",
  [STATUS.FREE]: "bg-green-500 text-white rounded-full !font-semibold",
};

const LKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-LK")}`;

/* ---------------- Edit Modal ---------------- */
function EditCarModal({ open, onClose, car, onSaved }) {
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open && car) {
      setForm({
        brand: car.brand || "",
        model: (car.name || "").replace(/^(\w+)\s*/i, "").trim() || "",
        year: car.year || "",
        type: car.type || "",
        transmission: car.transmission || "",
        fuel: car.fuel || "",
        seats: car.seats || "",
        price_per_day: car.price_per_day || "",
        description: car.description || "",
        city: car.city || "",
        district: car.district || "",
      });
      setFile(null);
      setPreview(null);
      setErr("");
    }
  }, [open, car]);

  if (!open || !form) return null;

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Only image files are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr("Image must be 5MB or less.");
      return;
    }
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr("");

      const fd = new FormData();
      fd.append("brand", form.brand);
      fd.append("model", form.model);
      if (form.year) fd.append("year", form.year);
      fd.append("category", form.type);
      if (form.transmission) fd.append("transmission", form.transmission);
      if (form.fuel) fd.append("fuelType", form.fuel);
      if (form.seats) fd.append("seats", form.seats);
      fd.append("dailyPrice", form.price_per_day);
      if (form.description) fd.append("description", form.description);
      if (form.city) fd.append("city", form.city);
      if (form.district) fd.append("district", form.district);
      if (file) fd.append("image", file);

      const res = await fetch(`${API_URL}/${car.id}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) {
        let msg = "Failed to update car";
        try {
          const j = await res.json();
          msg = j?.error || j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || "Failed to update car");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Edit Car</h2>
          <button className="p-1 rounded hover:bg-gray-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {err && (
          <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div
              className="h-40 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50
                         flex items-center justify-center text-gray-600 cursor-pointer overflow-hidden"
              onClick={() => document.getElementById("editUploadInput").click()}
              role="button"
            >
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : car.img ? (
                <img src={car.img} alt={car.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="h-7 w-7 mb-1" />
                  <div className="text-sm">Replace picture (optional)</div>
                </div>
              )}
            </div>
            <input
              id="editUploadInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Brand</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.brand} onChange={onChange("brand")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Model</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.model} onChange={onChange("model")} />
          </div>

          <div>
            <label className="text-xs text-gray-600">Year</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.year} onChange={onChange("year")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Category</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={onChange("type")}>
              <option>Sedan</option><option>SUV</option><option>Hatchback</option>
              <option>EV</option><option>Van</option><option>Luxury</option><option>Economy</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Transmission</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.transmission} onChange={onChange("transmission")}>
              <option value="">—</option><option>Automatic</option><option>Manual</option><option>Semi-Automatic</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Fuel</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.fuel} onChange={onChange("fuel")}>
              <option value="">—</option><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Seats</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.seats} onChange={onChange("seats")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Daily Price (LKR)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.price_per_day} onChange={onChange("price_per_day")} />
          </div>

          <div>
            <label className="text-xs text-gray-600">City</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.city} onChange={onChange("city")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">District</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.district} onChange={onChange("district")} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Description</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2" value={form.description} onChange={onChange("description")} />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function ManageCars() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [brush, setBrush] = useState({});
  const [edit, setEdit] = useState(null);

  // Fetch cars from backend
  async function loadCars() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("❌ Fetch cars failed:", err);
    }
  }
  useEffect(() => { loadCars(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    return rows.filter((r) =>
      `${r.brand} ${r.name} ${r.type}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, rows]);

  /* ------- Actions ------- */
  const toggleVisible = async (car) => {
    const next = car.available ? 0 : 1;
    // optimistic UI
    setRows((rs) => rs.map((r) => (r.id === car.id ? { ...r, available: next } : r)));
    try {
      const res = await fetch(`${API_URL}/${car.id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
    } catch (e) {
      console.error(e);
      // revert on failure
      setRows((rs) => rs.map((r) => (r.id === car.id ? { ...r, available: car.available } : r)));
      alert("Failed to change visibility.");
    }
  };

  const onDelete = async (car) => {
    if (!confirm(`Delete "${car.name}" permanently?`)) return;
    // optimistic
    const backup = rows;
    setRows((rs) => rs.filter((r) => r.id !== car.id));
    try {
      const res = await fetch(`${API_URL}/${car.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
      setRows(backup);
    }
  };

  const toggleCalendar = (id) => {
    setCalendarOpen((prev) => (prev === id ? null : id));
    setBrush((b) => (b[id] ? b : { ...b, [id]: STATUS.BOOKED }));
  };

  const applyStatus = (carId, date) => {
    const active = brush[carId] || STATUS.BOOKED;
    const key = date.toDateString();
    setBookingData((prev) => {
      const current = prev[carId] || {};
      const next = { ...current };
      if (active === STATUS.CLEAR) delete next[key];
      else next[key] = active;
      return { ...prev, [carId]: next };
    });
  };

  const tileClassName = (carId) => (props) => {
    const key = props.date.toDateString();
    const status = bookingData[carId]?.[key];
    if (!status) return undefined;
    return TILE_CLASS[status];
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Manage Cars</h1>
          <p className="text-sm text-gray-500">View all listed cars, update details, and paint booking status per day.</p>
        </div>
        <a
          href="/cars/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Car
        </a>
      </header>

      {/* Toolbar */}
      <div className="mb-4 relative max-w-lg">
        <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by brand, name, or category…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-gray-500 border-b">
          <div className="col-span-5">Car</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y">
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3">
              {/* Car cell */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="h-12 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={r.img || r.image_url || "/placeholder.png"}
                    alt={r.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      {r.seats || "-"} seats
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{r.transmission || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="col-span-2 flex items-center">
                <Badge tone="blue">{r.type}</Badge>
              </div>

              {/* Price */}
              <div className="col-span-2 flex items-center text-gray-900 font-medium">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                {LKR(r.price_per_day)}
                <span className="text-xs text-gray-500 ml-1">/ day</span>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => toggleVisible(r)}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  title={r.available ? "Hide from site" : "Show on site"}
                >
                  {r.available ? (
                    <EyeOff className="h-4 w-4 text-gray-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-700" />
                  )}
                </button>

                <button
                  onClick={() => toggleCalendar(r.id)}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
                  title="Manage Calendar"
                >
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span className="hidden md:inline">Calendar</span>
                </button>

                <button
                  onClick={() => setEdit(r)}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={() => onDelete(r)}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </button>
              </div>

              {/* Calendar panel (demo/paint only) */}
              {calendarOpen === r.id && (
                <div className="col-span-12 mt-4 border-t pt-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">Paint as:</span>

                    {[
                      { k: STATUS.FREE, label: "Free", cls: "bg-green-500 text-white border-green-500", clsOff: "bg-white text-green-700 border-green-300" },
                      { k: STATUS.PENDING, label: "Pending", cls: "bg-amber-400 text-black border-amber-400", clsOff: "bg-white text-amber-700 border-amber-300" },
                      { k: STATUS.BOOKED, label: "Booked", cls: "bg-rose-500 text-white border-rose-500", clsOff: "bg-white text-rose-700 border-rose-300" },
                      { k: STATUS.CLEAR, label: (<><Eraser className="h-4 w-4" /> Clear</>), cls: "bg-gray-800 text-white border-gray-800", clsOff: "bg-white text-gray-700 border-gray-300" },
                    ].map(({ k, label, cls, clsOff }) => (
                      <button
                        key={k}
                        onClick={() => setBrush((b) => ({ ...b, [r.id]: k }))}
                        className={`px-3 py-1.5 rounded-md border flex items-center gap-1 ${
                          brush[r.id] === k ? cls : clsOff
                        }`}
                      >
                        {label}
                      </button>
                    ))}

                    <span className="ml-auto text-xs text-gray-500">
                      Tip: Click a date to apply the selected color.
                    </span>
                  </div>

                  <Calendar
                    onClickDay={(date) => applyStatus(r.id, date)}
                    tileClassName={tileClassName(r.id)}
                  />
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No cars found.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditCarModal
        open={!!edit}
        car={edit}
        onClose={() => setEdit(null)}
        onSaved={(updated) => {
          setRows((rs) => rs.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
        }}
      />
    </div>
  );
}

// src/pages/Admin/AddCar.jsx
import { useRef, useState } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Fuel,
  Gauge,
  Cog,
  CheckCircle2,
  XCircle,
} from "lucide-react";
// If you have this store, it will unlock admin links after save.
// If you don't, the code safely ignores it.
import { useUiMode } from "../../stores/useUiMode";

const API_URL = "http://localhost:5050/api/cars";

const SL_DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla",
  "Monaragala","Ratnapura","Kegalle",
];

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function AddCar() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [error, setError] = useState("");

  // Safely access optional store
  const ui = (() => {
    try { return useUiMode(); } catch { return {}; }
  })();
  const markCarAdded = ui?.markCarAdded;

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    dailyPrice: "",
    category: "",
    transmission: "",
    fuelType: "",
    seats: "",
    description: "",
    addressLine: "",
    city: "",
    district: "",
  });

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pickFile = () => fileRef.current?.click();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or less.");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer?.files?.[0]);
  };

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      year: "",
      dailyPrice: "",
      category: "",
      transmission: "",
      fuelType: "",
      seats: "",
      description: "",
      addressLine: "",
      city: "",
      district: "",
    });
    setFile(null);
    setPreview(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand || !form.model || !form.dailyPrice || !form.category) {
      setError("Please fill Brand, Model, Daily Price, and Category.");
      return;
    }
    if (!form.addressLine || !form.district) {
      setError("Please enter Address Line and District.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const fd = new FormData();
      fd.append("brand", form.brand);
      fd.append("model", form.model);
      if (form.year) fd.append("year", form.year);
      fd.append("category", form.category);
      if (form.transmission) fd.append("transmission", form.transmission);
      if (form.fuelType) fd.append("fuelType", form.fuelType);
      if (form.seats) fd.append("seats", form.seats);
      fd.append("dailyPrice", form.dailyPrice);
      if (form.description) fd.append("description", form.description);
      if (form.addressLine) fd.append("addressLine", form.addressLine);
      if (form.city) fd.append("city", form.city);
      if (form.district) fd.append("district", form.district);
      if (file) fd.append("image", file);

      const res = await fetch(API_URL, { method: "POST", body: fd });

      if (!res.ok) {
        let msg = "Something went wrong!";
        try {
          const j = await res.json();
          if (j?.error || j?.message) msg = j.error || j.message;
        } catch {}
        throw new Error(msg);
      }

      await res.json();

      // ✅ Unlock other admin features in the sidebar (if store exists)
      if (typeof markCarAdded === "function") {
        try { markCarAdded(); } catch {}
      }

      setSavedOnce(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Add New Car</h1>
        <p className="text-sm text-gray-500">Fill in details to list a new car for booking.</p>
      </div>

      {/* Success banner — includes 'Admin features are now unlocked.' */}
      {savedOnce && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="font-medium">Car saved successfully.</div>
            <div>Admin features are now unlocked.</div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 flex items-start gap-3">
          <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Card */}
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload */}
          <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="lg:col-span-1">
            <div
              className="h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50
                         flex flex-col items-center justify-center text-gray-600 cursor-pointer"
              onClick={pickFile}
              role="button"
            >
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 mb-2" />
                  <div className="text-sm font-medium">Upload a picture of your car</div>
                  <div className="text-xs text-gray-500">Click to browse or drag &amp; drop (max 5MB)</div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Form fields */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Brand" required>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Toyota, BMW, Honda"
                value={form.brand}
                onChange={onChange("brand")}
              />
            </Field>

            <Field label="Model" required>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Axio, 3 Series, Civic"
                value={form.model}
                onChange={onChange("model")}
              />
            </Field>

            <Field label="Year">
              <input
                type="number"
                min="1990"
                max="2035"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., 2019"
                value={form.year}
                onChange={onChange("year")}
              />
            </Field>

            <Field label="Daily Price (LKR)" required>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., 9800"
                value={form.dailyPrice}
                onChange={onChange("dailyPrice")}
              />
            </Field>

            <Field label="Category" required>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                value={form.category}
                onChange={onChange("category")}
              >
                <option value="">Select a category</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Hatchback</option>
                <option>EV</option>
                <option>Van</option>
                <option>Luxury</option>
                <option>Economy</option>
              </select>
            </Field>

            <Field label="Transmission">
              <div className="relative">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.transmission}
                  onChange={onChange("transmission")}
                >
                  <option value="">Select a transmission</option>
                  <option>Automatic</option>
                  <option>Manual</option>
                  <option>Semi-Automatic</option>
                </select>
                <Cog className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </Field>

            <Field label="Fuel Type">
              <div className="relative">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.fuelType}
                  onChange={onChange("fuelType")}
                >
                  <option value="">Select a fuel type</option>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
                <Fuel className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </Field>

            <Field label="Seating Capacity">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., 5"
                  value={form.seats}
                  onChange={onChange("seats")}
                />
                <Gauge className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </Field>

            {/* Address */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Field label="Address Line" required>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., No. 12, Lake Road, Nawala"
                    value={form.addressLine}
                    onChange={onChange("addressLine")}
                  />
                </Field>
              </div>

              <div className="md:col-span-1">
                <Field label="City / Town">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., Rajagiriya"
                    value={form.city}
                    onChange={onChange("city")}
                  />
                </Field>
              </div>

              <div className="md:col-span-1">
                <Field label="District" required>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    value={form.district}
                    onChange={onChange("district")}
                  >
                    <option value="">Select district</option>
                    {SL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., A luxurious SUV with a spacious interior and a powerful engine."
                  value={form.description}
                  onChange={onChange("description")}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white ${
              saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save Car"}
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = "/admin")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

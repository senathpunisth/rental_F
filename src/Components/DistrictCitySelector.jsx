// src/components/DistrictCitySelector.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, ChevronDown, Search as SearchIcon } from "lucide-react";

/* Districts & Cities (same list you use on Home) */
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

/* Tiny slide-down container for the City select */
function Collapse({ open, children, className = "" }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    setH(open ? ref.current.scrollHeight : 0);
  }, [open, children]);
  return (
    <div className={`overflow-hidden transition-all duration-300 ${className}`} style={{ maxHeight: h }}>
      <div ref={ref}>{children}</div>
    </div>
  );
}

/**
 * DistrictCitySelector (compact)
 * Props:
 *  - dist, setDist (string, fn)
 *  - city, setCity (string, fn)
 *  - label? (string) – optional label shown above controls
 *  - small? (boolean) – keeps compact sizing; default true
 *  - className? (string) – wrapper classes
 */
export default function DistrictCitySelector({
  dist,
  setDist,
  city,
  setCity,
  label = "Pickup Location",
  small = true,
  className = "",
}) {
  // reset city when district changes
  useEffect(() => setCity(""), [dist]); // eslint-disable-line react-hooks/exhaustive-deps

  const cityOptions = useMemo(() => DISTRICTS_WITH_CITIES[dist] || [], [dist]);

  const fieldBase = `w-full border border-slate-300 outline-none focus:border-blue-400 appearance-none bg-white`;
  const sizeCls  = small ? "pl-8 pr-6 py-1.5 text-sm rounded-lg" : "pl-9 pr-8 py-2 rounded-xl";
  const iconSize = small ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>

      {/* District (compact) */}
      <div className="relative mb-2">
        <MapPin className={`${iconSize} absolute left-3 top-1/2 -translate-y-1/2 text-blue-600`} />
        <select
          value={dist}
          onChange={(e) => setDist(e.target.value)}
          className={`${fieldBase} ${sizeCls}`}
        >
          {SL_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <ChevronDown className={`${iconSize} absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
      </div>

      {/* City slides down under the district */}
      <Collapse open={!!dist}>
        <label className="block text-[11px] font-medium text-slate-600 mb-1">
          {dist ? `City (in ${dist})` : "City"}
        </label>
        <div className="relative">
          <SearchIcon className={`${iconSize} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`${fieldBase} ${sizeCls}`}
          >
            <option value="">All Cities</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className={`${iconSize} absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
        </div>
      </Collapse>
    </div>
  );
}

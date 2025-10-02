// src/components/AvailabilityCalendar.jsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Utils */
const fmt = (d) => d.toISOString().slice(0, 10);
const toDate = (str) => {
  const [y, m, dd] = str.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Expand a date range [start..end] (inclusive) to a Set of yyyy-mm-dd */
const expandRange = (startStr, endStr) => {
  const set = new Set();
  let d = toDate(startStr);
  const end = toDate(endStr);
  while (d <= end) {
    set.add(fmt(d));
    d = addDays(d, 1);
  }
  return set;
};

function buildMonthMatrix(year, monthIndex, startsOnMonday = false) {
  // monthIndex: 0=Jan
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstWeekday = first.getDay(); // 0=Sun..6=Sat
  const shift = startsOnMonday ? ((firstWeekday + 6) % 7) : firstWeekday;
  const daysInMonth = last.getDate();

  const cells = [];
  // leading blanks (previous month tail)
  for (let i = 0; i < shift; i++) cells.push(null);
  // month days
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  // trailing blanks to fill 6 rows of 7 (consistent height)
  while (cells.length % 7 !== 0) cells.push(null);
  // ensure at least 42 cells (6 rows)
  while (cells.length < 42) cells.push(null);

  // chunk by 7
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * AvailabilityCalendar
 * Props:
 * - reservations: [{start, end, status: 'confirmed'|'pending'}]
 * - monthStart?: Date (optional default: today)
 * - startsOnMonday?: boolean
 */
export default function AvailabilityCalendar({
  reservations = [],
  monthStart = new Date(),
  startsOnMonday = false,
}) {
  const [cursor, setCursor] = useState(
    new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  );

  // Precompute day-status maps for fast lookup
  const statusMap = useMemo(() => {
    const map = new Map(); // yyyy-mm-dd -> 'confirmed'|'pending'
    // confirmed should win over pending if overlaps
    // fill pending first, then confirmed overwrites
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
  const weeks = useMemo(
    () => buildMonthMatrix(year, month, startsOnMonday),
    [year, month, startsOnMonday]
  );

  const today = new Date();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const dayLabels = startsOnMonday
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      {/* Header */}
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

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
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
                isNull
                  ? ""
                  : st === "confirmed"
                  ? "Booked"
                  : st === "pending"
                  ? "Pending"
                  : "Available"
              }
            >
              {!isNull && <span className="text-xs">{d.getDate()}</span>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
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

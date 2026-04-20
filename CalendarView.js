// frontend/src/components/CalendarView.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CalendarView({ habitId: initialHabitId }) {
  const [habits, setHabits] = useState([]);
  const [habitId, setHabitId] = useState(initialHabitId || "");
  const [logs, setLogs] = useState([]);
  const [month, setMonth] = useState(new Date());

  const userId = 1;

  /* ---------- FETCH HABITS ---------- */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/habits/${userId}`)
      .then((res) => {
        const list = res.data || [];
        setHabits(list);
        if (!habitId && list.length) setHabitId(list[0].id);
      })
      .catch((err) => console.error("Habits fetch:", err));
    // eslint-disable-next-line
  }, []);

  /* ---------- FETCH LOGS ---------- */
  useEffect(() => {
    if (!habitId) return;
    axios
      .get(`http://localhost:5000/habits/${habitId}/calendar`)
      .then((res) => setLogs(res.data || []))
      .catch((err) => console.error("Calendar fetch:", err));
  }, [habitId]);

  /* ---------- DATE HELPERS ---------- */
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const iso = (d) => new Date(year, m, d).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const statusFor = (dateIso) =>
    logs.find((l) => l.date === dateIso)?.status || null;

  /* ---------- BUILD GRID ---------- */
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateIso = iso(d);
    const status = statusFor(dateIso);
    cells.push({
      day: d,
      dateIso,
      status,
      isToday: dateIso === today,
      isPast: dateIso < today
    });
  }

  return (
    <div className="page-card">
      {/* HEADER */}
      <div className="cal-header">
        <button onClick={() => setMonth(new Date(year, m - 1, 1))}>‹</button>

        <h3>
          {month.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <button onClick={() => setMonth(new Date(year, m + 1, 1))}>›</button>
      </div>

      {/* HABIT SELECT */}
      <div style={{ marginBottom: 12 }}>
        <select
          value={habitId || ""}
          onChange={(e) => setHabitId(Number(e.target.value))}
        >
          <option value="">Select habit</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* WEEKDAYS */}
      <div className="cal-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="cal-weekday">
            {d}
          </div>
        ))}

        {/* CELLS */}
        {cells.map((c, i) =>
          c.empty ? (
            <div key={i} className="cal-cell empty" />
          ) : (
            <div
              key={c.dateIso}
              className={`cal-cell
                ${c.status === "done" ? "done" : ""}
                ${c.isPast && !c.status ? "missed" : ""}
                ${c.isToday ? "today" : ""}
              `}
            >
              <div className="date-num">{c.day}</div>
            </div>
          )
        )}
      </div>

      {/* LEGEND */}
      <div className="legend">
        <span>
          <span className="dot done"></span> Done
        </span>
        <span>
          <span className="dot missed"></span> Missed
        </span>
      </div>
    </div>
  );
}

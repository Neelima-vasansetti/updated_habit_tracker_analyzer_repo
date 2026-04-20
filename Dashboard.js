import { useEffect, useState } from "react";
import axios from "axios";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [mode, setMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    try {
      setLoading(true);

      let res;
      if (mode === "dropdown") {
        res = await axios.get("http://localhost:5000/habits/1");
        setHabits(
          res.data.filter(
            h => h.schedule === "daily" || (h.days || []).includes(selectedDay)
          )
        );
        setSummary(null);
      } else {
        res = await axios.get(
          `http://localhost:5000/dashboard/1/${mode}`
        );
        setHabits(res.data.habits || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "dropdown" && !selectedDay) return;
    loadHabits();
  }, [mode, selectedDay]);

  // ✅ Mark habit done
  const toggleDone = async habitId => {
    try {
      await axios.post("http://localhost:5000/logs", {
        habitId,
        date: new Date().toISOString().split("T")[0],
        status: "done"
      });
      loadHabits();
    } catch (err) {
      console.error("Mark done error", err);
    }
  };

  if (loading) {
    return <div className="page-animate">Loading dashboard...</div>;
  }

  return (
    <div className="page-animate">
      <div className="header-flex">
        <h2>Dashboard</h2>
        <div className="dashboard-controls">
          <button
            className={mode === "today" ? "active" : ""}
            onClick={() => { setMode("today"); setSelectedDay(""); }}
          >
            Today
          </button>
          <button
            className={mode === "tomorrow" ? "active" : ""}
            onClick={() => { setMode("tomorrow"); setSelectedDay(""); }}
          >
            Tomorrow
          </button>

          <select
            value={selectedDay}
            onChange={e => {
              setMode("dropdown");
              setSelectedDay(e.target.value);
            }}
          >
            <option value="">Select weekday</option>
            {WEEKDAYS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="label">Monthly Completion</div>
            <div className="value">{summary.completionRate}%</div>
          </div>
          <div className="stat-card">
            <div className="label">Longest Streak</div>
            <div className="value">🔥 {summary.longestStreak}</div>
          </div>
          <div className="stat-card">
            <div className="label">Done This Month</div>
            <div className="value">✅ {summary.doneThisMonth}</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <p className="dashboard-empty">No habits scheduled for this view.</p>
      )}

      {/* Habit Cards */}
      <div className="grid-list">
        {habits.map(h => (
          <div key={h.id} className={`habit-card ${h.doneToday ? "done" : ""}`}>
            <div className="habit-header">
              <div className="habit-left">
                <div className="custom-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="habit-check"
                    checked={!!h.doneToday}
                    onChange={() => toggleDone(h.id)}
                    disabled={h.doneToday}
                  />
                </div>
                <div>
                  <div className="habit-name">{h.name}</div>
                  <div className="habit-meta">
                    ⏰ {h.timing} &bull;
                    <span
                      style={{
                        color: (h.status || "").includes("Missed")
                          ? "#e11d48"
                          : (h.status || "").includes("On track")
                            ? "#059669"
                            : "#64748b",
                        fontWeight: 600,
                        marginLeft: 4
                      }}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              </div>
              {h.streak > 0 && <div className="streak-pill">🔥 {h.streak}</div>}
            </div>

            {/* 📊 Habit Analysis */}
            <div className="completion-wrap">
              <div className="completion-label">
                <span>30-Day Rate</span>
                <span>{h.completionRate || 0}%</span>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-fill"
                  style={{ width: `${h.completionRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

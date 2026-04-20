import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data to get summary stats and habit list
    axios.get("http://localhost:5000/dashboard/1/today")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load report data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-animate">Loading reports...</div>;
  if (!data) return <div className="page-animate">Failed to load data.</div>;

  const { summary, habits } = data;

  // Calculate Insights
  const sortedByRate = [...habits].sort((a, b) => b.completionRate - a.completionRate);
  const bestHabit = sortedByRate[0];
  const worstHabit = [...habits].reverse().find(h => h.completionRate < 50 && h.totalLogs > 0) || sortedByRate[sortedByRate.length - 1];

  return (
    <div className="page-animate">
      <div className="header-flex" style={{ marginBottom: 24 }}>
        <div>
          <h2>Monthly Report</h2>
          <p className="muted">Analyze your performance and trends.</p>
        </div>
        <button className="primary" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="label">Avg. Completion</div>
          <div className="value">{summary.completionRate}%</div>
          <div className="trend">Across all habits</div>
        </div>
        <div className="stat-card">
          <div className="label">Longest Streak</div>
          <div className="value">🔥 {summary.longestStreak}</div>
          <div className="trend">Days in a row</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Done (Month)</div>
          <div className="value">✅ {summary.doneThisMonth}</div>
          <div className="trend">Successful check-ins</div>
        </div>
      </div>

      {/* Insights Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div className="habit-card" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" }}>
          <h4 style={{ margin: 0, opacity: 0.9 }}>🏆 Top Performer</h4>
          {bestHabit ? (
            <>
              <div style={{ fontSize: 24, fontWeight: "bold", margin: "10px 0" }}>{bestHabit.name}</div>
              <div style={{ opacity: 0.9 }}>{bestHabit.completionRate}% completion rate. Keep it up!</div>
            </>
          ) : (
            <p>No data yet.</p>
          )}
        </div>

        <div className="habit-card" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white" }}>
          <h4 style={{ margin: 0, opacity: 0.9 }}>🎯 Needs Focus</h4>
          {worstHabit ? (
            <>
              <div style={{ fontSize: 24, fontWeight: "bold", margin: "10px 0" }}>{worstHabit.name}</div>
              <div style={{ opacity: 0.9 }}>Only {worstHabit.completionRate}% completion. You can do this!</div>
            </>
          ) : (
            <p>All habits are on track!</p>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <h3 style={{ marginBottom: 16 }}>Habit Breakdown</h3>
      <div className="habit-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px" }}>Habit Name</th>
              <th style={{ padding: "16px" }}>Current Streak</th>
              <th style={{ padding: "16px" }}>Completion (30d)</th>
              <th style={{ padding: "16px" }}>Total Logs</th>
              <th style={{ padding: "16px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {habits.map(h => (
              <tr key={h.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px", fontWeight: 500 }}>{h.name}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    background: h.streak > 3 ? "#dcfce7" : "#f1f5f9",
                    color: h.streak > 3 ? "#166534" : "#64748b",
                    fontSize: 12,
                    fontWeight: "bold"
                  }}>
                    {h.streak} days
                  </span>
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, maxWidth: 60 }}>
                      <div style={{ width: `${h.completionRate}%`, background: "#6366f1", height: "100%", borderRadius: 3 }}></div>
                    </div>
                    <span style={{ fontSize: 13 }}>{h.completionRate}%</span>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>{h.totalLogs}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: h.status.includes("On track") ? "#d1fae5" : h.status.includes("Missed") ? "#fef3c7" : "#fee2e2",
                    color: h.status.includes("On track") ? "#047857" : h.status.includes("Missed") ? "#b45309" : "#b91c1c"
                  }}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
